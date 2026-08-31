import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import UrunFormu from "@/components/urun-formu";
import { formSecenekleri } from "../form-verileri";

export const dynamic = "force-dynamic";
export const metadata = { title: "Yeni Ürün — Mikro Stok Takip" };

export default async function YeniUrunSayfasi() {
  const { tipler, malzemeler, musteriler } = await formSecenekleri();

  if (tipler.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p className="text-slate-600">
          Henüz ürün tipi tanımlı değil. Önce{" "}
          <Link href="/ayarlar/urun-tipleri" className="text-sky-600 hover:underline">
            ürün tiplerini
          </Link>{" "}
          oluşturun.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/urunler"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900"
        >
          <ChevronLeft className="h-4 w-4" />
          Ürünler
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">Yeni Ürün</h1>
      </div>

      <UrunFormu tipler={tipler} malzemeler={malzemeler} musteriler={musteriler} />
    </div>
  );
}
