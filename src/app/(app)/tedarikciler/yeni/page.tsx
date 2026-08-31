import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import CariFormu from "@/components/cari-formu";

export const metadata = { title: "Yeni Tedarikçi — Mikro Stok Takip" };

export default function YeniTedarikciSayfasi() {
  return (
    <div className="space-y-5">
      <div>
        <Link href="/tedarikciler" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900">
          <ChevronLeft className="h-4 w-4" />
          Tedarikçiler
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">Yeni Tedarikçi</h1>
      </div>

      <CariFormu tur="tedarikci" />
    </div>
  );
}
