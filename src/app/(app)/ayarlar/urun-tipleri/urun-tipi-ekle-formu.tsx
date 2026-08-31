"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { Plus } from "lucide-react";
import { urunTipiEkle, type AyarDurumu } from "../actions";

function Buton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      <Plus className="h-4 w-4" />
      {pending ? "Ekleniyor..." : "Ekle"}
    </button>
  );
}

export default function UrunTipiEkleFormu() {
  const [durum, formAction] = useActionState<AyarDurumu, FormData>(urunTipiEkle, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (durum.basarili) formRef.current?.reset();
  }, [durum]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-wrap items-start gap-2">
      <input
        name="name"
        required
        placeholder="Örn: Körük, Diyafram, Sünger Profil"
        className="input max-w-xs flex-1"
      />
      <Buton />
      {durum.hata && <span className="self-center text-sm text-red-600">{durum.hata}</span>}
      {durum.basarili && <span className="self-center text-sm text-emerald-600">{durum.basarili}</span>}
    </form>
  );
}
