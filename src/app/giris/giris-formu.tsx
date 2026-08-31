"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, LogIn } from "lucide-react";
import { girisYap, type GirisDurumu } from "./actions";

function GirisButonu() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      <LogIn className="h-4 w-4" />
      {pending ? "Giriş yapılıyor..." : "Giriş Yap"}
    </button>
  );
}

export default function GirisFormu({ devam }: { devam: string }) {
  const [durum, formAction] = useActionState<GirisDurumu, FormData>(girisYap, {});

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="devam" value={devam} />

      <div>
        <label className="label" htmlFor="email">
          E-posta
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          autoFocus
          className="input"
          placeholder="ad@mikromuhendislik.com"
        />
      </div>

      <div>
        <label className="label" htmlFor="sifre">
          Şifre
        </label>
        <input
          id="sifre"
          name="sifre"
          type="password"
          autoComplete="current-password"
          required
          className="input"
          placeholder="••••••••"
        />
      </div>

      {durum.hata && (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{durum.hata}</span>
        </div>
      )}

      <GirisButonu />
    </form>
  );
}
