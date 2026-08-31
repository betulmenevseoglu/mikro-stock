import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { tarihFormat } from "@/lib/format";
import { kullaniciDurumDegistir } from "../actions";
import KullaniciEkleFormu from "./kullanici-ekle-formu";
import SifreFormu from "./sifre-formu";

export const dynamic = "force-dynamic";
export const metadata = { title: "Kullanıcılar — Mikro Stok Takip" };

export default async function KullanicilarSayfasi() {
  const [oturum, kullanicilar] = await Promise.all([
    requireUser(),
    prisma.user.findMany({ orderBy: { createdAt: "asc" } }),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <Link href="/ayarlar" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900">
          <ChevronLeft className="h-4 w-4" />
          Ayarlar
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">Kullanıcılar</h1>
        <p className="mt-1 text-sm text-slate-500">
          Tüm kullanıcıların yetkileri aynıdır — herkes her işlemi yapabilir.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="card table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Ad Soyad</th>
                  <th>E-posta</th>
                  <th>Eklenme</th>
                  <th>Durum</th>
                  <th className="text-right">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {kullanicilar.map((k) => (
                  <tr key={k.id}>
                    <td className="font-medium text-slate-900">
                      {k.name}
                      {k.id === oturum.id && (
                        <span className="badge ml-2 bg-sky-50 text-sky-700">siz</span>
                      )}
                    </td>
                    <td className="text-slate-500">{k.email}</td>
                    <td className="text-slate-500">{tarihFormat(k.createdAt)}</td>
                    <td>
                      {k.isActive ? (
                        <span className="badge bg-emerald-50 text-emerald-700">aktif</span>
                      ) : (
                        <span className="badge bg-slate-100 text-slate-500">pasif</span>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-2">
                        <SifreFormu kullaniciId={k.id} kullaniciAdi={k.name} />
                        {k.id !== oturum.id && (
                          <form action={kullaniciDurumDegistir}>
                            <input type="hidden" name="id" value={k.id} />
                            <button type="submit" className="btn-secondary px-3 py-1.5 text-xs">
                              {k.isActive ? "Pasife al" : "Aktife al"}
                            </button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="card p-5">
            <h2 className="mb-4 font-semibold text-slate-900">Yeni Kullanıcı</h2>
            <KullaniciEkleFormu />
          </div>
        </div>
      </div>
    </div>
  );
}
