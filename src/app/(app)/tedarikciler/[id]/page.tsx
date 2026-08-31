import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Trash2, ArrowDownLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import CariFormu from "@/components/cari-formu";
import { tedarikciSil } from "../../cari-actions";
import { miktarFormat, tarihSaatFormat } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function TedarikciSayfasi({ params }: PageProps<"/tedarikciler/[id]">) {
  const { id } = await params;

  const tedarikci = await prisma.supplier.findUnique({ where: { id } });
  if (!tedarikci) notFound();

  const hareketler = await prisma.stockMovement.findMany({
    where: { supplierId: id },
    include: { product: { select: { id: true, code: true, name: true, unit: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/tedarikciler" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900">
            <ChevronLeft className="h-4 w-4" />
            Tedarikçiler
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">{tedarikci.name}</h1>
        </div>

        <form action={tedarikciSil}>
          <input type="hidden" name="id" value={tedarikci.id} />
          <button type="submit" className="btn-danger">
            <Trash2 className="h-4 w-4" />
            Sil
          </button>
        </form>
      </div>

      <CariFormu
        tur="tedarikci"
        cari={{
          id: tedarikci.id,
          code: tedarikci.code,
          name: tedarikci.name,
          contactName: tedarikci.contactName,
          phone: tedarikci.phone,
          email: tedarikci.email,
          address: tedarikci.address,
          taxOffice: tedarikci.taxOffice,
          taxNumber: tedarikci.taxNumber,
          notes: tedarikci.notes,
          isActive: tedarikci.isActive,
        }}
      />

      <section className="card">
        <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-4">
          <ArrowDownLeft className="h-4.5 w-4.5 text-slate-400" />
          <h2 className="font-semibold text-slate-900">Bu Tedarikçiden Girişler</h2>
          <span className="text-sm text-slate-400">({hareketler.length})</span>
        </div>

        {hareketler.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-slate-500">
            Bu tedarikçiden kayıtlı giriş yok.
          </p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Tarih</th>
                  <th>Ürün</th>
                  <th className="text-right">Miktar</th>
                  <th>İrsaliye</th>
                </tr>
              </thead>
              <tbody>
                {hareketler.map((h) => (
                  <tr key={h.id}>
                    <td className="whitespace-nowrap text-slate-500">{tarihSaatFormat(h.createdAt)}</td>
                    <td>
                      <Link href={`/urunler/${h.product.id}`} className="font-medium text-slate-900">
                        {h.product.name}
                      </Link>
                      <div className="font-mono text-xs text-slate-400">{h.product.code}</div>
                    </td>
                    <td className="text-right font-medium text-emerald-600">
                      +{miktarFormat(h.quantity)}
                    </td>
                    <td className="text-slate-500">{h.reference ?? "—"}</td>
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
