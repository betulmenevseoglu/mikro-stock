"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, Check, Plus } from "lucide-react";
import { malzemeKaydet, type AyarDurumu } from "../actions";

function Buton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      <Plus className="h-4 w-4" />
      {pending ? "Ekleniyor..." : "Malzeme Ekle"}
    </button>
  );
}

export default function MalzemeEkleFormu() {
  const [durum, formAction] = useActionState<AyarDurumu, FormData>(malzemeKaydet, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (durum.basarili) formRef.current?.reset();
  }, [durum]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <div>
        <label className="label" htmlFor="name">
          Malzeme Adı
        </label>
        <input id="name" name="name" required className="input" placeholder="Örn: HNBR" />
      </div>

      <div>
        <label className="label" htmlFor="code">
          Kısa Kod
        </label>
        <input id="code" name="code" className="input font-mono" placeholder="HNBR" />
      </div>

      <div>
        <label className="label" htmlFor="notes">
          Not
        </label>
        <input id="notes" name="notes" className="input" placeholder="Sıcaklık aralığı, sertifika..." />
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          name="foodGrade"
          className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
        />
        Gıda / ilaç uygunluğu var
      </label>

      {durum.hata && (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{durum.hata}</span>
        </div>
      )}

      {durum.basarili && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          <Check className="h-4 w-4" />
          {durum.basarili}
        </div>
      )}

      <Buton />
    </form>
  );
}
