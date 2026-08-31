import { prisma } from "@/lib/prisma";

export type EkOzellik = { label: string; value: string };

/** specs JSON yapısı: tip şablonu alanları + kullanıcının eklediği serbest alanlar */
export type Specs = Record<string, string | number | null | EkOzellik[]> & {
  _extra?: EkOzellik[];
};

export function ekOzellikleriAyikla(specs: unknown): EkOzellik[] {
  if (!specs || typeof specs !== "object") return [];
  const extra = (specs as Specs)._extra;
  if (!Array.isArray(extra)) return [];
  return extra.filter((e) => e && typeof e.label === "string" && e.label.trim() !== "");
}

export function tanimliSpecDegeri(specs: unknown, key: string): string {
  if (!specs || typeof specs !== "object") return "";
  const value = (specs as Record<string, unknown>)[key];
  if (value === null || value === undefined) return "";
  return String(value);
}

/**
 * FormData'dan specs nesnesi kurar.
 * Tip alanları: spec_<key>   Ek alanlar: ekOzellikAd / ekOzellikDeger (çoklu)
 */
export function formdanSpecs(formData: FormData): Specs {
  const specs: Specs = {};

  for (const [name, raw] of formData.entries()) {
    if (!name.startsWith("spec_")) continue;
    const key = name.slice(5);
    const value = String(raw).trim();
    if (value === "") continue;
    const sayi = Number(value.replace(",", "."));
    specs[key] = Number.isFinite(sayi) && value !== "" && /^[\d.,\s-]+$/.test(value) ? sayi : value;
  }

  const adlar = formData.getAll("ekOzellikAd").map((v) => String(v).trim());
  const degerler = formData.getAll("ekOzellikDeger").map((v) => String(v).trim());
  const extra: EkOzellik[] = [];

  adlar.forEach((label, i) => {
    const value = degerler[i] ?? "";
    if (label !== "") extra.push({ label, value });
  });

  if (extra.length > 0) specs._extra = extra;

  return specs;
}

/** Kod verilmediyse tip kısaltmasından sıralı stok kodu üretir: ORI-0001 */
export async function otomatikKodUret(productTypeId: string): Promise<string> {
  const tip = await prisma.productType.findUnique({
    where: { id: productTypeId },
    select: { slug: true },
  });

  const onek = (tip?.slug ?? "urn")
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 3)
    .toUpperCase()
    .padEnd(3, "X");

  for (let deneme = 0; deneme < 50; deneme++) {
    const adet = await prisma.product.count({ where: { code: { startsWith: `${onek}-` } } });
    const kod = `${onek}-${String(adet + 1 + deneme).padStart(4, "0")}`;
    const varMi = await prisma.product.findUnique({ where: { code: kod }, select: { id: true } });
    if (!varMi) return kod;
  }

  return `${onek}-${Date.now().toString().slice(-6)}`;
}
