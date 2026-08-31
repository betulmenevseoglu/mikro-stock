"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  Users,
  Truck,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cikisYap } from "@/app/giris/actions";
import type { SessionUser } from "@/lib/session";

const MENU = [
  { href: "/", label: "Panel", icon: LayoutDashboard, exact: true },
  { href: "/urunler", label: "Ürünler", icon: Package },
  { href: "/hareketler", label: "Stok Hareketleri", icon: ArrowLeftRight },
  { href: "/musteriler", label: "Müşteriler", icon: Users },
  { href: "/tedarikciler", label: "Tedarikçiler", icon: Truck },
  { href: "/ayarlar", label: "Ayarlar", icon: Settings },
];

export default function Sidebar({
  user,
  logo,
  mobilLogo,
}: {
  user: SessionUser;
  logo: ReactNode;
  mobilLogo: ReactNode;
}) {
  const pathname = usePathname();
  const [acik, setAcik] = useState(false);

  const linkler = MENU.map((item) => {
    const aktif = item.exact ? pathname === item.href : pathname.startsWith(item.href);
    const Icon = item.icon;
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => setAcik(false)}
        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
          aktif
            ? "bg-sky-50 text-sky-700"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        }`}
      >
        <Icon className="h-4.5 w-4.5 shrink-0" />
        {item.label}
      </Link>
    );
  });

  return (
    <>
      {/* Mobil üst bar */}
      <div className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
        <div className="flex items-center gap-2">
          {mobilLogo}
        </div>
        <button
          onClick={() => setAcik(!acik)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          aria-label="Menü"
        >
          {acik ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {acik && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
          onClick={() => setAcik(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform lg:translate-x-0 ${
          acik ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center gap-2.5 border-b border-slate-200 px-5">
          {logo}
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">{linkler}</nav>

        <div className="border-t border-slate-200 p-3">
          <div className="mb-2 px-3 py-1">
            <div className="truncate text-sm font-medium text-slate-900">{user.name}</div>
            <div className="truncate text-xs text-slate-500">{user.email}</div>
          </div>
          <form action={cikisYap}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-700"
            >
              <LogOut className="h-4.5 w-4.5" />
              Çıkış Yap
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
