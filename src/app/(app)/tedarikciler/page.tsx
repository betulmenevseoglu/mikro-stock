import Link from "next/link";
import { Plus, Truck, Phone, Mail } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tedarikçiler — Mikro Stok Takip" };

export default async function TedarikcilerSayfasi() {
  const tedarikciler = await prisma.supplier.findMany({
    include: { _count: { select: { products: true, movements: true } } },
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Tedarikçiler</h1>
          <p className="mt-1 text-sm text-slate-500">{tedarikciler.length} kayıt</p>
        </div>
        <Link href="/tedarikciler/yeni" className="btn-primary">
          <Plus className="h-4 w-4" />
          Yeni Tedarikçi
        </Link>
      </div>

      {tedarikciler.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 px-6 py-16 text-center">
          <Truck className="h-10 w-10 text-slate-300" />
          <p className="text-sm text-slate-500">Henüz tedarikçi eklenmemiş.</p>
          <Link href="/tedarikciler/yeni" className="btn-secondary">
            <Plus className="h-4 w-4" />
            İlk tedarikçiyi ekle
          </Link>
        </div>
      ) : (
        <div className="card table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Ünvan</th>
                <th>Yetkili</th>
                <th>İletişim</th>
                <th className="text-right">Ürün</th>
                <th className="text-right">Hareket</th>
              </tr>
            </thead>
            <tbody>
              {tedarikciler.map((m) => (
                <tr key={m.id}>
                  <td>
                    <Link href={`/tedarikciler/${m.id}`} className="block">
                      <span className="font-medium text-slate-900">{m.name}</span>
                      {!m.isActive && (
                        <span className="badge ml-2 bg-slate-100 text-slate-500">pasif</span>
                      )}
                      {m.code && <div className="font-mono text-xs text-slate-400">{m.code}</div>}
                    </Link>
                  </td>
                  <td className="text-slate-500">{m.contactName ?? "—"}</td>
                  <td className="text-slate-500">
                    {m.phone && (
                      <div className="flex items-center gap-1.5 text-xs">
                        <Phone className="h-3 w-3 text-slate-400" />
                        {m.phone}
                      </div>
                    )}
                    {m.email && (
                      <div className="flex items-center gap-1.5 text-xs">
                        <Mail className="h-3 w-3 text-slate-400" />
                        {m.email}
                      </div>
                    )}
                    {!m.phone && !m.email && "—"}
                  </td>
                  <td className="text-right text-slate-500">{m._count.products}</td>
                  <td className="text-right text-slate-500">{m._count.movements}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
