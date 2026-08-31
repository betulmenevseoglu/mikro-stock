"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { X, Download } from "lucide-react";

type Secenek = { id: string; name: string };

export default function HareketFiltreleri({
  musteriler,
  tedarikciler,
}: {
  musteriler: Secenek[];
  tedarikciler: Secenek[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  function guncelle(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value === "") next.delete(key);
    else next.set(key, value);
    startTransition(() => router.push(`/hareketler?${next.toString()}`));
  }

  const filtreVar = Array.from(params.keys()).length > 0;

  return (
    <div className="card p-4">
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
        <div>
          <label className="label" htmlFor="baslangic">
            Başlangıç
          </label>
          <input
            id="baslangic"
            type="date"
            className="input"
            defaultValue={params.get("baslangic") ?? ""}
            onChange={(e) => guncelle("baslangic", e.target.value)}
          />
        </div>

        <div>
          <label className="label" htmlFor="bitis">
            Bitiş
          </label>
          <input
            id="bitis"
            type="date"
            className="input"
            defaultValue={params.get("bitis") ?? ""}
            onChange={(e) => guncelle("bitis", e.target.value)}
          />
        </div>

        <div>
          <label className="label" htmlFor="tip">
            Hareket Tipi
          </label>
          <select
            id="tip"
            className="input"
            value={params.get("tip") ?? ""}
            onChange={(e) => guncelle("tip", e.target.value)}
          >
            <option value="">Tümü</option>
            <option value="GIRIS">Giriş</option>
            <option value="CIKIS">Çıkış</option>
            <option value="SAYIM">Sayım</option>
          </select>
        </div>

        <div>
          <label className="label" htmlFor="musteri">
            Müşteri
          </label>
          <select
            id="musteri"
            className="input"
            value={params.get("musteri") ?? ""}
            onChange={(e) => guncelle("musteri", e.target.value)}
          >
            <option value="">Tümü</option>
            {musteriler.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="tedarikci">
            Tedarikçi
          </label>
          <select
            id="tedarikci"
            className="input"
            value={params.get("tedarikci") ?? ""}
            onChange={(e) => guncelle("tedarikci", e.target.value)}
          >
            <option value="">Tümü</option>
            {tedarikciler.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <a href={`/hareketler/disa-aktar?${params.toString()}`} className="btn-secondary py-1.5 text-xs">
          <Download className="h-3.5 w-3.5" />
          Excel'e aktar (CSV)
        </a>

        {filtreVar && (
          <button
            type="button"
            onClick={() => startTransition(() => router.push("/hareketler"))}
            className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900"
          >
            <X className="h-3.5 w-3.5" />
            Filtreleri temizle
          </button>
        )}

        {pending && <span className="text-xs text-slate-400">Yükleniyor...</span>}
      </div>
    </div>
  );
}
