import Link from "next/link";
import { ChevronLeft, Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { tipAlaniSil, urunTipiDurumDegistir } from "../actions";
import UrunTipiEkleFormu from "./urun-tipi-ekle-formu";
import TipAlaniEkleFormu from "./tip-alani-ekle-formu";

export const dynamic = "force-dynamic";
export const metadata = { title: "Ürün Tipleri — Mikro Stok Takip" };

const TIP_ETIKET: Record<string, string> = {
  NUMBER: "Sayı",
  TEXT: "Metin",
  SELECT: "Liste",
};

export default async function UrunTipleriSayfasi() {
  const tipler = await prisma.productType.findMany({
    include: {
      fields: { orderBy: { sortOrder: "asc" } },
      _count: { select: { products: true } },
    },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="space-y-5">
      <div>
        <Link href="/ayarlar" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900">
          <ChevronLeft className="h-4 w-4" />
          Ayarlar
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">Ürün Tipleri ve Alanları</h1>
        <p className="mt-1 text-sm text-slate-500">
          Her tipin kendi ölçü alanları vardır. Ürün eklerken tip seçilince bu alanlar formda çıkar.
        </p>
      </div>

      <div className="card p-5">
        <h2 className="mb-3 font-semibold text-slate-900">Yeni Ürün Tipi</h2>
        <UrunTipiEkleFormu />
      </div>

      <div className="space-y-4">
        {tipler.map((tip) => (
          <section key={tip.id} className="card p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-semibold text-slate-900">
                  {tip.name}
                  {!tip.isActive && (
                    <span className="badge ml-2 bg-slate-100 text-slate-500">pasif</span>
                  )}
                </h3>
                <p className="text-xs text-slate-400">
                  {tip._count.products} ürün · {tip.fields.length} tanımlı alan
                </p>
              </div>

              <form action={urunTipiDurumDegistir}>
                <input type="hidden" name="id" value={tip.id} />
                <button type="submit" className="btn-secondary px-3 py-1.5 text-xs">
                  {tip.isActive ? "Pasife al" : "Aktife al"}
                </button>
              </form>
            </div>

            {tip.fields.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {tip.fields.map((alan) => (
                  <div
                    key={alan.id}
                    className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5"
                  >
                    <span className="text-sm text-slate-700">
                      {alan.label}
                      {alan.unit && <span className="text-slate-400"> ({alan.unit})</span>}
                    </span>
                    <span className="badge bg-white text-slate-500">{TIP_ETIKET[alan.type]}</span>
                    <form action={tipAlaniSil}>
                      <input type="hidden" name="id" value={alan.id} />
                      <button
                        type="submit"
                        className="text-slate-300 transition hover:text-red-600"
                        aria-label={`${alan.label} alanını sil`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            )}

            <TipAlaniEkleFormu productTypeId={tip.id} />
          </section>
        ))}
      </div>
    </div>
  );
}
