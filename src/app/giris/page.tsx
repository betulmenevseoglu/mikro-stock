import { Suspense } from "react";
import GirisFormu from "./giris-formu";
import Logo from "@/components/logo";

export const metadata = { title: "Giriş — Mikro Sızdırmazlık Stok Takip" };

export default async function GirisSayfasi({ searchParams }: PageProps<"/giris">) {
  const params = await searchParams;
  const devam = typeof params.devam === "string" ? params.devam : "/";

  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-slate-100 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Logo yukseklik={52} className="mx-auto mb-5" />
          <h1 className="text-lg font-medium text-slate-700">Stok Takip Uygulaması</h1>
          <p className="mt-2 text-sm text-slate-500">Devam etmek için giriş yapın</p>
        </div>

        <div className="card p-6">
          <Suspense>
            <GirisFormu devam={devam} />
          </Suspense>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Mikro Sızdırmazlık · Makro deneyim, Mikro maliyet
        </p>
      </div>
    </div>
  );
}
