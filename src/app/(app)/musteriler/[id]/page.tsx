import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Trash2, Package } from "lucide-react";
import { prisma } from "@/lib/prisma";
import CariFormu from "@/components/cari-formu";
import { musteriSil } from "../../cari-actions";
import { miktarBirim } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function MusteriSayfasi({ params }: PageProps<"/musteriler/[id]">) {
  const { id } = await params;

  const musteri = await prisma.customer.findUnique({
    where: { id },
    include: {
      products: {
        where: { isActive: true },
        include: { productType: { select: { name: true } } },
        orderBy: { name: "asc" },
      },
    },
  });

  if (!musteri) notFound();

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/musteriler" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900">
            <ChevronLeft className="h-4 w-4" />
            Müşteriler
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">{musteri.name}</h1>
        </div>

        <form action={musteriSil}>
          <input type="hidden" name="id" value={musteri.id} />
          <button type="submit" className="btn-danger">
            <Trash2 className="h-4 w-4" />
            Sil
          </button>
        </form>
      </div>

      <CariFormu
        tur="musteri"
        cari={{
          id: musteri.id,
          code: musteri.code,
          name: musteri.name,
          contactName: musteri.contactName,
          phone: musteri.phone,
          email: musteri.email,
          address: musteri.address,
          taxOffice: musteri.taxOffice,
          taxNumber: musteri.taxNumber,
          notes: musteri.notes,
          isActive: musteri.isActive,
        }}
      />

      <section className="card">
        <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-4">
          <Package className="h-4.5 w-4.5 text-slate-400" />
          <h2 className="font-semibold text-slate-900">Bu Müşteriye Özel Ürünler</h2>
          <span className="text-sm text-slate-400">({musteri.products.length})</span>
        </div>

        {musteri.products.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-slate-500">
            Bu müşteriye tanımlı ürün yok.
          </p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Stok Kodu</th>
                  <th>Ürün</th>
                  <th>Tip</th>
                  <th>Müşteri Parça No</th>
                  <th className="text-right">Stok</th>
                </tr>
              </thead>
              <tbody>
                {musteri.products.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <Link href={`/urunler/${u.id}`} className="font-mono text-xs text-slate-500">
                        {u.code}
                      </Link>
                    </td>
                    <td>
                      <Link href={`/urunler/${u.id}`} className="font-medium text-slate-900">
                        {u.name}
                      </Link>
                    </td>
                    <td className="text-slate-500">{u.productType.name}</td>
                    <td className="text-slate-500">{u.customerPartNo ?? "—"}</td>
                    <td className="text-right font-medium text-slate-900">
                      {miktarBirim(u.quantity, u.unit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
