import Link from "next/link";
import { Package, AlertTriangle, Users, Truck, ArrowDownLeft, ArrowUpRight, ClipboardList } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { miktarBirim, tarihSaatFormat, HAREKET_ETIKET } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function PanelSayfasi() {
  const [urunSayisi, musteriSayisi, tedarikciSayisi, kritikUrunler, sonHareketler] =
    await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.customer.count({ where: { isActive: true } }),
      prisma.supplier.count({ where: { isActive: true } }),
      prisma.product.findMany({
        where: {
          isActive: true,
          minQuantity: { gt: 0 },
          quantity: { lte: prisma.product.fields.minQuantity },
        },
        include: { productType: true },
        orderBy: { name: "asc" },
        take: 20,
      }),
      prisma.stockMovement.findMany({
        include: {
          product: { select: { code: true, name: true, unit: true } },
          user: { select: { name: true } },
          customer: { select: { name: true } },
          supplier: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

  const kartlar = [
    { label: "Aktif Ürün", value: urunSayisi, icon: Package, href: "/urunler", renk: "text-sky-600 bg-sky-50" },
    {
      label: "Kritik Stok",
      value: kritikUrunler.length,
      icon: AlertTriangle,
      href: "/urunler?kritik=1",
      renk: kritikUrunler.length > 0 ? "text-amber-600 bg-amber-50" : "text-slate-400 bg-slate-50",
    },
    { label: "Müşteri", value: musteriSayisi, icon: Users, href: "/musteriler", renk: "text-violet-600 bg-violet-50" },
    { label: "Tedarikçi", value: tedarikciSayisi, icon: Truck, href: "/tedarikciler", renk: "text-emerald-600 bg-emerald-50" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Panel</h1>
        <p className="mt-1 text-sm text-slate-500">Stok durumuna genel bakış</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kartlar.map((k) => {
          const Icon = k.icon;
          return (
            <Link key={k.label} href={k.href} className="card p-4 transition hover:shadow-md">
              <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg ${k.renk}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="text-2xl font-semibold text-slate-900">{k.value}</div>
              <div className="text-sm text-slate-500">{k.label}</div>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Kritik stok */}
        <section className="card">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h2 className="flex items-center gap-2 font-semibold text-slate-900">
              <AlertTriangle className="h-4.5 w-4.5 text-amber-500" />
              Kritik Stok
            </h2>
            <Link href="/urunler?kritik=1" className="text-sm text-sky-600 hover:underline">
              Tümü
            </Link>
          </div>

          {kritikUrunler.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-slate-500">
              Kritik seviyede ürün yok. 👍
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {kritikUrunler.slice(0, 8).map((u) => (
                <li key={u.id}>
                  <Link href={`/urunler/${u.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-slate-900">{u.name}</div>
                      <div className="truncate text-xs text-slate-500">
                        {u.code} · {u.productType.name}
                      </div>
                    </div>
                    <div className="ml-3 shrink-0 text-right">
                      <div className="text-sm font-semibold text-amber-600">
                        {miktarBirim(u.quantity, u.unit)}
                      </div>
                      <div className="text-xs text-slate-400">
                        min. {miktarBirim(u.minQuantity, u.unit)}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Son hareketler */}
        <section className="card">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h2 className="flex items-center gap-2 font-semibold text-slate-900">
              <ClipboardList className="h-4.5 w-4.5 text-slate-400" />
              Son Hareketler
            </h2>
            <Link href="/hareketler" className="text-sm text-sky-600 hover:underline">
              Tümü
            </Link>
          </div>

          {sonHareketler.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-slate-500">Henüz hareket yok.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {sonHareketler.map((h) => {
                const giris = h.type === "GIRIS";
                const sayim = h.type === "SAYIM";
                return (
                  <li key={h.id} className="flex items-start gap-3 px-5 py-3">
                    <div
                      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
                        sayim
                          ? "bg-slate-100 text-slate-500"
                          : giris
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-red-50 text-red-600"
                      }`}
                    >
                      {sayim ? (
                        <ClipboardList className="h-4 w-4" />
                      ) : giris ? (
                        <ArrowDownLeft className="h-4 w-4" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm text-slate-900">
                        <span className="font-medium">{h.product.name}</span>
                      </div>
                      <div className="truncate text-xs text-slate-500">
                        {HAREKET_ETIKET[h.type]} · {miktarBirim(h.quantity, h.product.unit)}
                        {h.customer ? ` · ${h.customer.name}` : ""}
                        {h.supplier ? ` · ${h.supplier.name}` : ""}
                      </div>
                      <div className="text-xs text-slate-400">
                        {tarihSaatFormat(h.createdAt)} · {h.user.name}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
