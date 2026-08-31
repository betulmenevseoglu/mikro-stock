"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Search, X } from "lucide-react";

type Secenek = { id: string; name: string };

export default function UrunFiltreleri({
  tipler,
  malzemeler,
  musteriler,
}: {
  tipler: Secenek[];
  malzemeler: Secenek[];
  musteriler: Secenek[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  function guncelle(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value === "" || value === "0") next.delete(key);
    else next.set(key, value);
    startTransition(() => router.push(`/urunler?${next.toString()}`));
  }

  const filtreVar = Array.from(params.keys()).length > 0;

  return (
    <div className="card p-4">
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              defaultValue={params.get("q") ?? ""}
              placeholder="Stok kodu, ürün adı, müşteri parça no, kalıp no..."
              className="input pl-9"
              onKeyDown={(e) => {
                if (e.key === "Enter") guncelle("q", e.currentTarget.value.trim());
              }}
              onBlur={(e) => {
                const yeni = e.currentTarget.value.trim();
                if (yeni !== (params.get("q") ?? "")) guncelle("q", yeni);
              }}
            />
          </div>
        </div>

        <select
          className="input"
          value={params.get("tip") ?? ""}
          onChange={(e) => guncelle("tip", e.target.value)}
        >
          <option value="">Tüm tipler</option>
          {tipler.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>

        <select
          className="input"
          value={params.get("malzeme") ?? ""}
          onChange={(e) => guncelle("malzeme", e.target.value)}
        >
          <option value="">Tüm malzemeler</option>
          {malzemeler.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>

        <select
          className="input"
          value={params.get("musteri") ?? ""}
          onChange={(e) => guncelle("musteri", e.target.value)}
        >
          <option value="">Tüm müşteriler</option>
          {musteriler.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-4 lg:col-span-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              checked={params.get("kritik") === "1"}
              onChange={(e) => guncelle("kritik", e.target.checked ? "1" : "")}
            />
            Sadece kritik stok
          </label>

          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              checked={params.get("pasif") === "1"}
              onChange={(e) => guncelle("pasif", e.target.checked ? "1" : "")}
            />
            Pasif ürünler
          </label>

          {filtreVar && (
            <button
              type="button"
              onClick={() => startTransition(() => router.push("/urunler"))}
              className="ml-auto inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900"
            >
              <X className="h-3.5 w-3.5" />
              Filtreleri temizle
            </button>
          )}
        </div>
      </div>

      {pending && <div className="mt-2 text-xs text-slate-400">Yükleniyor...</div>}
    </div>
  );
}
