import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import UrunFormu from "@/components/urun-formu";
import { formSecenekleri } from "../../form-verileri";
import { ekOzellikleriAyikla } from "@/lib/urun";

export const dynamic = "force-dynamic";

export default async function UrunDuzenleSayfasi({
  params,
}: PageProps<"/urunler/[id]/duzenle">) {
  const { id } = await params;

  const [urun, secenekler] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    formSecenekleri(),
  ]);

  if (!urun) notFound();

  // specs içindeki tanımlı alanları string map'e çevir (_extra hariç)
  const specsRaw = (urun.specs ?? {}) as Record<string, unknown>;
  const specs: Record<string, string> = {};
  for (const [key, value] of Object.entries(specsRaw)) {
    if (key === "_extra") continue;
    specs[key] = value === null || value === undefined ? "" : String(value);
  }

  return (
    <div className="space-y-5">
      <div>
        <Link
          href={`/urunler/${urun.id}`}
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900"
        >
          <ChevronLeft className="h-4 w-4" />
          {urun.name}
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">Ürünü Düzenle</h1>
      </div>

      <UrunFormu
        {...secenekler}
        urun={{
          id: urun.id,
          code: urun.code,
          name: urun.name,
          productTypeId: urun.productTypeId,
          materialId: urun.materialId,
          hardnessShoreA: urun.hardnessShoreA,
          color: urun.color,
          unit: urun.unit,
          minQuantity: Number(urun.minQuantity),
          isCustom: urun.isCustom,
          customerId: urun.customerId,
          customerPartNo: urun.customerPartNo,
          moldNo: urun.moldNo,
          notes: urun.notes,
          isActive: urun.isActive,
          specs,
          ekOzellikler: ekOzellikleriAyikla(urun.specs),
        }}
      />
    </div>
  );
}
