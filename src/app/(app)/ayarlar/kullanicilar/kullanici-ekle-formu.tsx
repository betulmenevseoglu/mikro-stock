"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, Check, UserPlus } from "lucide-react";
import { kullaniciEkle, type AyarDurumu } from "../actions";

function Buton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      <UserPlus className="h-4 w-4" />
      {pending ? "Ekleniyor..." : "Kullanıcı Ekle"}
    </button>
  );
}

export default function KullaniciEkleFormu() {
  const [durum, formAction] = useActionState<AyarDurumu, FormData>(kullaniciEkle, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (durum.basarili) formRef.current?.reset();
  }, [durum]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <div>
        <label className="label" htmlFor="name">
          Ad Soyad
        </label>
        <input id="name" name="name" required className="input" />
      </div>

      <div>
        <label className="label" htmlFor="email">
          E-posta
        </label>
        <input id="email" name="email" type="email" required className="input" />
      </div>

      <div>
        <label className="label" htmlFor="sifre">
          Şifre
        </label>
        <input id="sifre" name="sifre" type="text" required minLength={6} className="input" />
        <p className="mt-1 text-xs text-slate-400">En az 6 karakter. Kullanıcıya iletin.</p>
      </div>

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
