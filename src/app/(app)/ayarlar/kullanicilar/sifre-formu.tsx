"use client";

import { useActionState, useState } from "react";
import { KeyRound } from "lucide-react";
import { sifreDegistir, type AyarDurumu } from "../actions";

export default function SifreFormu({
  kullaniciId,
  kullaniciAdi,
}: {
  kullaniciId: string;
  kullaniciAdi: string;
}) {
  const [acik, setAcik] = useState(false);
  const [durum, formAction] = useActionState<AyarDurumu, FormData>(sifreDegistir, {});

  if (!acik) {
    return (
      <button
        type="button"
        onClick={() => setAcik(true)}
        className="btn-secondary px-3 py-1.5 text-xs"
      >
        <KeyRound className="h-3.5 w-3.5" />
        Şifre
      </button>
    );
  }

  return (
    <form action={formAction} className="flex items-center gap-1">
      <input type="hidden" name="id" value={kullaniciId} />
      <input
        name="sifre"
        type="text"
        required
        minLength={6}
        autoFocus
        placeholder={`${kullaniciAdi} için yeni şifre`}
        className="input w-44 py-1.5 text-xs"
      />
      <button type="submit" className="btn-primary px-3 py-1.5 text-xs">
        Kaydet
      </button>
      <button
        type="button"
        onClick={() => setAcik(false)}
        className="btn-secondary px-2 py-1.5 text-xs"
      >
        ✕
      </button>
      {durum.hata && <span className="text-xs text-red-600">{durum.hata}</span>}
      {durum.basarili && <span className="text-xs text-emerald-600">✓</span>}
    </form>
  );
}
