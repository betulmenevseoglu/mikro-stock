import Link from "next/link";
import { Users, Layers, FlaskConical, ChevronRight } from "lucide-react";

export const metadata = { title: "Ayarlar — Mikro Stok Takip" };

const BOLUMLER = [
  {
    href: "/ayarlar/kullanicilar",
    icon: Users,
    baslik: "Kullanıcılar",
    aciklama: "Sisteme giriş yapabilecek kişileri yönetin, şifre belirleyin.",
  },
  {
    href: "/ayarlar/urun-tipleri",
    icon: Layers,
    baslik: "Ürün Tipleri ve Alanları",
    aciklama: "O-Ring, hortum, conta gibi tipleri ve her tipin ölçü alanlarını tanımlayın.",
  },
  {
    href: "/ayarlar/malzemeler",
    icon: FlaskConical,
    baslik: "Malzemeler",
    aciklama: "Silikon, NBR, EPDM gibi malzeme listesini düzenleyin.",
  },
];

export default function AyarlarSayfasi() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Ayarlar</h1>
        <p className="mt-1 text-sm text-slate-500">Sistem tanımlarını buradan yönetin</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {BOLUMLER.map((b) => {
          const Icon = b.icon;
          return (
            <Link key={b.href} href={b.href} className="card p-5 transition hover:shadow-md">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex items-center gap-1 font-semibold text-slate-900">
                {b.baslik}
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </div>
              <p className="mt-1 text-sm text-slate-500">{b.aciklama}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
