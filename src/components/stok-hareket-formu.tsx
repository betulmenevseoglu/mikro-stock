"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, ArrowDownLeft, ArrowUpRight, ClipboardList, Check } from "lucide-react";
import { stokHareketiEkle, type FormDurumu } from "@/app/(app)/urunler/actions";
import type { Secenek } from "@/components/urun-formu";

type Tip = "GIRIS" | "CIKIS" | "SAYIM";

const TIPLER: { value: Tip; label: string; icon: typeof ArrowDownLeft; renk: string }[] = [
  { value: "GIRIS", label: "Giriş", icon: ArrowDownLeft, renk: "bg-emerald-600" },
  { value: "CIKIS", label: "Çıkış", icon: ArrowUpRight, renk: "bg-red-600" },
  { value: "SAYIM", label: "Sayım", icon: ClipboardList, renk: "bg-slate-600" },
];

function Buton({ tip }: { tip: Tip }) {
  const { pending } = useFormStatus();
  const etiket = tip === "GIRIS" ? "Giriş Yap" : tip === "CIKIS" ? "Çıkış Yap" : "Sayımı Kaydet";
  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      {pending ? "Kaydediliyor..." : etiket}
    </button>
  );
}

export default function StokHareketFormu({
  productId,
  birim,
  mevcutStok,
  musteriler,
  tedarikciler,
}: {
  productId: string;
  birim: string;
  mevcutStok: number;
  musteriler: Secenek[];
  tedarikciler: Secenek[];
}) {
  const [durum, formAction] = useActionState<FormDurumu, FormData>(stokHareketiEkle, {});
  const [tip, setTip] = useState<Tip>("GIRIS");
  const formRef = useRef<HTMLFormElement>(null);
  const [basariMesaji, setBasariMesaji] = useState(false);

  useEffect(() => {
    if (durum.basarili) {
      formRef.current?.reset();
      setBasariMesaji(true);
      const t = setTimeout(() => setBasariMesaji(false), 2500);
      return () => clearTimeout(t);
    }
  }, [durum]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="type" value={tip} />

      <div className="grid grid-cols-3 gap-2">
        {TIPLER.map((t) => {
          const Icon = t.icon;
          const aktif = tip === t.value;
          return (
            <button
              key={t.value}
              type="button"
              onClick={() => setTip(t.value)}
              className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-2.5 text-xs font-medium transition ${
                aktif
                  ? `${t.renk} border-transparent text-white`
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      <div>
        <label className="label" htmlFor="quantity">
          {tip === "SAYIM" ? "Sayılan Miktar" : "Miktar"}{" "}
          <span className="font-normal text-slate-400">({birim})</span>
        </label>
        <input
          id="quantity"
          name="quantity"
          inputMode="decimal"
          required
          className="input"
          placeholder={tip === "SAYIM" ? `Mevcut: ${mevcutStok}` : "0"}
        />
        {tip === "SAYIM" && (
          <p className="mt-1 text-xs text-slate-400">
            Stok bu değere eşitlenir. Sayım farkı hareket olarak kaydedilir.
          </p>
        )}
      </div>

      {tip === "CIKIS" && (
        <div>
          <label className="label" htmlFor="customerId">
            Müşteri
          </label>
          <select id="customerId" name="customerId" className="input">
            <option value="">Seçilmedi</option>
            {musteriler.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {tip === "GIRIS" && (
        <div>
          <label className="label" htmlFor="supplierId">
            Tedarikçi
          </label>
          <select id="supplierId" name="supplierId" className="input">
            <option value="">Seçilmedi</option>
            {tedarikciler.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="label" htmlFor="reference">
          İrsaliye / Referans No
        </label>
        <input id="reference" name="reference" className="input" placeholder="İsteğe bağlı" />
      </div>

      <div>
        <label className="label" htmlFor="note">
          Açıklama
        </label>
        <input id="note" name="note" className="input" placeholder="İsteğe bağlı" />
      </div>

      {durum.hata && (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{durum.hata}</span>
        </div>
      )}

      {basariMesaji && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          <Check className="h-4 w-4" />
          Hareket kaydedildi.
        </div>
      )}

      <Buton tip={tip} />
    </form>
  );
}
