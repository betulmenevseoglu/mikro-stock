"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Plus } from "lucide-react";
import { tipAlaniEkle, type AyarDurumu } from "../actions";

function Buton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-secondary px-3 py-1.5 text-xs" disabled={pending}>
      <Plus className="h-3.5 w-3.5" />
      {pending ? "..." : "Alan Ekle"}
    </button>
  );
}

export default function TipAlaniEkleFormu({ productTypeId }: { productTypeId: string }) {
  const [durum, formAction] = useActionState<AyarDurumu, FormData>(tipAlaniEkle, {});
  const [tip, setTip] = useState("NUMBER");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (durum.basarili) {
      formRef.current?.reset();
      setTip("NUMBER");
    }
  }, [durum]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
      <input type="hidden" name="productTypeId" value={productTypeId} />

      <input name="label" required placeholder="Alan adı (örn. Flanş Çapı)" className="input w-52 py-1.5 text-xs" />

      <select
        name="type"
        value={tip}
        onChange={(e) => setTip(e.target.value)}
        className="input w-28 py-1.5 text-xs"
      >
        <option value="NUMBER">Sayı</option>
        <option value="TEXT">Metin</option>
        <option value="SELECT">Liste</option>
      </select>

      {tip !== "SELECT" && (
        <input name="unit" placeholder="Birim (mm)" className="input w-28 py-1.5 text-xs" />
      )}

      {tip === "SELECT" && (
        <input
          name="options"
          placeholder="Seçenekler: virgülle ayırın"
          className="input w-64 py-1.5 text-xs"
        />
      )}

      <Buton />

      {durum.hata && <span className="text-xs text-red-600">{durum.hata}</span>}
      {durum.basarili && <span className="text-xs text-emerald-600">{durum.basarili}</span>}
    </form>
  );
}
