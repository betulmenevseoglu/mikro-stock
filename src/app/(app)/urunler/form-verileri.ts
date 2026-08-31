import { prisma } from "@/lib/prisma";
import type { TipSecenegi, Secenek } from "@/components/urun-formu";

/** Ürün formunun ihtiyaç duyduğu seçenek listeleri */
export async function formSecenekleri(): Promise<{
  tipler: TipSecenegi[];
  malzemeler: Secenek[];
  musteriler: Secenek[];
}> {
  const [tipler, malzemeler, musteriler] = await Promise.all([
    prisma.productType.findMany({
      where: { isActive: true },
      include: { fields: { orderBy: { sortOrder: "asc" } } },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.material.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.customer.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);

  return {
    tipler: tipler.map((t) => ({
      id: t.id,
      name: t.name,
      fields: t.fields.map((f) => ({
        key: f.key,
        label: f.label,
        type: f.type,
        unit: f.unit,
        options: f.options,
        required: f.required,
      })),
    })),
    malzemeler: malzemeler.map((m) => ({ id: m.id, name: m.name })),
    musteriler: musteriler.map((m) => ({ id: m.id, name: m.name })),
  };
}
