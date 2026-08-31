import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { malzemeDurumDegistir } from "../actions";
import MalzemeEkleFormu from "./malzeme-ekle-formu";

export const dynamic = "force-dynamic";
export const metadata = { title: "Malzemeler — Mikro Stok Takip" };

export default async function MalzemelerSayfasi() {
  const malzemeler = await prisma.material.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-5">
      <div>
        <Link href="/ayarlar" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900">
          <ChevronLeft className="h-4 w-4" />
          Ayarlar
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">Malzemeler</h1>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="card table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Malzeme</th>
                  <th>Kod</th>
                  <th>Gıda/İlaç</th>
                  <th className="text-right">Ürün</th>
                  <th className="text-right">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {malzemeler.map((m) => (
                  <tr key={m.id}>
                    <td className="font-medium text-slate-900">
                      {m.name}
                      {!m.isActive && (
                        <span className="badge ml-2 bg-slate-100 text-slate-500">pasif</span>
                      )}
                      {m.notes && <div className="text-xs text-slate-400">{m.notes}</div>}
                    </td>
                    <td className="font-mono text-xs text-slate-500">{m.code ?? "—"}</td>
                    <td>
                      {m.foodGrade ? (
                        <span className="badge bg-emerald-50 text-emerald-700">uygun</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="text-right text-slate-500">{m._count.products}</td>
                    <td className="text-right">
                      <form action={malzemeDurumDegistir}>
                        <input type="hidden" name="id" value={m.id} />
                        <button type="submit" className="btn-secondary px-3 py-1.5 text-xs">
                          {m.isActive ? "Pasife al" : "Aktife al"}
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="card p-5">
            <h2 className="mb-4 font-semibold text-slate-900">Yeni Malzeme</h2>
            <MalzemeEkleFormu />
          </div>
        </div>
      </div>
    </div>
  );
}
