import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ChevronLeft,
  Pencil,
  Star,
  Trash2,
  AlertTriangle,
  ImageOff,
  ArrowDownLeft,
  ArrowUpRight,
  ClipboardList,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { miktarBirim, miktarFormat, tarihSaatFormat, BIRIM_ETIKET, HAREKET_ETIKET } from "@/lib/format";
import { ekOzellikleriAyikla } from "@/lib/urun";
import StokHareketFormu from "@/components/stok-hareket-formu";
import { resimSil, resimBirincilYap, urunDurumDegistir } from "../actions";

export const dynamic = "force-dynamic";

export default async function UrunDetaySayfasi({ params }: PageProps<"/urunler/[id]">) {
  const { id } = await params;

  const urun = await prisma.product.findUnique({
    where: { id },
    include: {
      productType: { include: { fields: { orderBy: { sortOrder: "asc" } } } },
      material: true,
      customer: true,
      images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] },
      suppliers: { include: { supplier: true } },
    },
  });

  if (!urun) notFound();

  const [hareketler, musteriler, tedarikciler] = await Promise.all([
    prisma.stockMovement.findMany({
      where: { productId: id },
      include: {
        user: { select: { name: true } },
        customer: { select: { name: true } },
        supplier: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.customer.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.supplier.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);

  const specs = (urun.specs ?? {}) as Record<string, unknown>;
  const ekOzellikler = ekOzellikleriAyikla(urun.specs);
  const min = Number(urun.minQuantity);
  const kritikMi = min > 0 && Number(urun.quantity) <= min;

  const tanimliSatirlar = urun.productType.fields
    .map((f) => ({
      label: f.label + (f.unit ? ` (${f.unit})` : ""),
      value: specs[f.key] === undefined || specs[f.key] === null ? "" : String(specs[f.key]),
    }))
    .filter((s) => s.value !== "");

  const genelSatirlar = [
    { label: "Ürün Tipi", value: urun.productType.name },
    { label: "Malzeme", value: urun.material?.name ?? "" },
    { label: "Sertlik", value: urun.hardnessShoreA ? `${urun.hardnessShoreA} Shore A` : "" },
    { label: "Renk", value: urun.color ?? "" },
    { label: "Müşteri", value: urun.customer?.name ?? "" },
    { label: "Müşteri Parça No", value: urun.customerPartNo ?? "" },
    { label: "Kalıp No", value: urun.moldNo ?? "" },
  ].filter((s) => s.value !== "");

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href="/urunler"
            className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900"
          >
            <ChevronLeft className="h-4 w-4" />
            Ürünler
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold text-slate-900">{urun.name}</h1>
            {urun.isCustom && (
              <span className="badge bg-violet-50 text-violet-700">Müşteriye özel</span>
            )}
            {!urun.isActive && <span className="badge bg-slate-100 text-slate-500">Pasif</span>}
          </div>
          <p className="mt-1 font-mono text-sm text-slate-500">{urun.code}</p>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/urunler/${urun.id}/duzenle`} className="btn-secondary">
            <Pencil className="h-4 w-4" />
            Düzenle
          </Link>
          <form action={urunDurumDegistir}>
            <input type="hidden" name="id" value={urun.id} />
            <button type="submit" className="btn-secondary">
              {urun.isActive ? "Pasife Al" : "Aktife Al"}
            </button>
          </form>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Sol: bilgiler */}
        <div className="space-y-5 lg:col-span-2">
          {/* Stok özeti */}
          <div className="card p-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="text-sm text-slate-500">Mevcut Stok</div>
                <div
                  className={`mt-1 flex items-center gap-2 text-3xl font-semibold ${
                    kritikMi ? "text-amber-600" : "text-slate-900"
                  }`}
                >
                  {kritikMi && <AlertTriangle className="h-6 w-6" />}
                  {miktarFormat(urun.quantity)}
                  <span className="text-lg font-normal text-slate-400">
                    {BIRIM_ETIKET[urun.unit]}
                  </span>
                </div>
              </div>

              {min > 0 && (
                <div className="text-right">
                  <div className="text-sm text-slate-500">Kritik Seviye</div>
                  <div className="mt-1 text-lg font-medium text-slate-700">
                    {miktarBirim(urun.minQuantity, urun.unit)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Resimler */}
          <section className="card p-5">
            <h2 className="mb-4 font-semibold text-slate-900">Resimler</h2>

            {urun.images.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-slate-400">
                <ImageOff className="h-8 w-8" />
                <p className="text-sm">Henüz resim eklenmemiş.</p>
                <Link href={`/urunler/${urun.id}/duzenle`} className="text-sm text-sky-600 hover:underline">
                  Resim ekle
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {urun.images.map((resim) => (
                  <div key={resim.id} className="group relative">
                    <Image
                      src={resim.url}
                      alt={urun.name}
                      width={300}
                      height={300}
                      style={{ height: "auto" }}
                      className="aspect-square w-full rounded-lg object-cover ring-1 ring-slate-200"
                    />
                    {resim.isPrimary && (
                      <span className="absolute left-2 top-2 badge bg-sky-600 text-white">
                        <Star className="h-3 w-3 fill-current" />
                        Kapak
                      </span>
                    )}
                    <div className="absolute inset-x-2 bottom-2 flex gap-1 opacity-0 transition group-hover:opacity-100">
                      {!resim.isPrimary && (
                        <form action={resimBirincilYap} className="flex-1">
                          <input type="hidden" name="imageId" value={resim.id} />
                          <input type="hidden" name="productId" value={urun.id} />
                          <button
                            type="submit"
                            className="w-full rounded-md bg-white/95 px-2 py-1 text-xs font-medium text-slate-700 shadow hover:bg-white"
                          >
                            Kapak yap
                          </button>
                        </form>
                      )}
                      <form action={resimSil}>
                        <input type="hidden" name="imageId" value={resim.id} />
                        <input type="hidden" name="productId" value={urun.id} />
                        <button
                          type="submit"
                          className="rounded-md bg-white/95 px-2 py-1 text-xs font-medium text-red-600 shadow hover:bg-white"
                          aria-label="Resmi sil"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Özellikler */}
          <section className="card p-5">
            <h2 className="mb-4 font-semibold text-slate-900">Özellikler</h2>

            <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {[...genelSatirlar, ...tanimliSatirlar, ...ekOzellikler.map((e) => ({ label: e.label, value: e.value }))].map(
                (satir, i) => (
                  <div key={`${satir.label}-${i}`} className="flex justify-between gap-4 border-b border-slate-100 pb-2">
                    <dt className="text-sm text-slate-500">{satir.label}</dt>
                    <dd className="text-sm font-medium text-slate-900 text-right">{satir.value}</dd>
                  </div>
                ),
              )}
            </dl>

            {urun.notes && (
              <div className="mt-5 rounded-lg bg-slate-50 p-4">
                <div className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                  Notlar
                </div>
                <p className="whitespace-pre-wrap text-sm text-slate-700">{urun.notes}</p>
              </div>
            )}
          </section>

          {/* Hareket geçmişi */}
          <section className="card">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h2 className="font-semibold text-slate-900">Stok Hareketleri</h2>
              <Link href={`/hareketler?urun=${urun.id}`} className="text-sm text-sky-600 hover:underline">
                Tümü
              </Link>
            </div>

            {hareketler.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-slate-500">Henüz hareket yok.</p>
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Tarih</th>
                      <th>Tip</th>
                      <th className="text-right">Miktar</th>
                      <th className="text-right">Kalan</th>
                      <th>Cari / Referans</th>
                      <th>Kullanıcı</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hareketler.map((h) => {
                      const Icon =
                        h.type === "GIRIS" ? ArrowDownLeft : h.type === "CIKIS" ? ArrowUpRight : ClipboardList;
                      const renk =
                        h.type === "GIRIS"
                          ? "text-emerald-600"
                          : h.type === "CIKIS"
                            ? "text-red-600"
                            : "text-slate-500";
                      return (
                        <tr key={h.id}>
                          <td className="whitespace-nowrap text-slate-500">
                            {tarihSaatFormat(h.createdAt)}
                          </td>
                          <td>
                            <span className={`inline-flex items-center gap-1 font-medium ${renk}`}>
                              <Icon className="h-3.5 w-3.5" />
                              {HAREKET_ETIKET[h.type]}
                            </span>
                          </td>
                          <td className={`text-right font-medium ${renk}`}>
                            {h.type === "CIKIS" ? "−" : h.type === "GIRIS" ? "+" : ""}
                            {miktarFormat(h.quantity)}
                          </td>
                          <td className="text-right text-slate-500">{miktarFormat(h.balance)}</td>
                          <td className="text-slate-500">
                            {h.customer?.name ?? h.supplier?.name ?? "—"}
                            {h.reference && (
                              <div className="text-xs text-slate-400">{h.reference}</div>
                            )}
                            {h.note && <div className="text-xs text-slate-400">{h.note}</div>}
                          </td>
                          <td className="text-slate-500">{h.user.name}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        {/* Sağ: hızlı hareket */}
        <div className="lg:col-span-1">
          <div className="card sticky top-6 p-5">
            <h2 className="mb-4 font-semibold text-slate-900">Stok Hareketi Ekle</h2>
            <StokHareketFormu
              productId={urun.id}
              birim={BIRIM_ETIKET[urun.unit]}
              mevcutStok={Number(urun.quantity)}
              musteriler={musteriler.map((m) => ({ id: m.id, name: m.name }))}
              tedarikciler={tedarikciler.map((t) => ({ id: t.id, name: t.name }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
