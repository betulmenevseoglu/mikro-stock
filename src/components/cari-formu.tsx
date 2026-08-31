"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { AlertCircle, Save } from "lucide-react";
import { musteriKaydet, tedarikciKaydet, type CariDurumu } from "@/app/(app)/cari-actions";

export type CariVarsayilan = {
  id: string;
  code: string | null;
  name: string;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  taxOffice: string | null;
  taxNumber: string | null;
  notes: string | null;
  isActive: boolean;
};

function KaydetButonu() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      <Save className="h-4 w-4" />
      {pending ? "Kaydediliyor..." : "Kaydet"}
    </button>
  );
}

export default function CariFormu({
  tur,
  cari,
}: {
  tur: "musteri" | "tedarikci";
  cari?: CariVarsayilan;
}) {
  const action = tur === "musteri" ? musteriKaydet : tedarikciKaydet;
  const [durum, formAction] = useActionState<CariDurumu, FormData>(action, {});
  const geriYol = tur === "musteri" ? "/musteriler" : "/tedarikciler";

  return (
    <form action={formAction} className="space-y-5">
      {cari && <input type="hidden" name="id" value={cari.id} />}

      {durum.hata && (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{durum.hata}</span>
        </div>
      )}

      <section className="card p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="label" htmlFor="name">
              Ünvan / Firma Adı *
            </label>
            <input id="name" name="name" required defaultValue={cari?.name} className="input" />
          </div>

          <div>
            <label className="label" htmlFor="code">
              Cari Kodu
            </label>
            <input
              id="code"
              name="code"
              defaultValue={cari?.code ?? ""}
              className="input font-mono"
              placeholder="İsteğe bağlı"
            />
          </div>

          <div>
            <label className="label" htmlFor="contactName">
              Yetkili Kişi
            </label>
            <input
              id="contactName"
              name="contactName"
              defaultValue={cari?.contactName ?? ""}
              className="input"
            />
          </div>

          <div>
            <label className="label" htmlFor="phone">
              Telefon
            </label>
            <input id="phone" name="phone" defaultValue={cari?.phone ?? ""} className="input" />
          </div>

          <div>
            <label className="label" htmlFor="email">
              E-posta
            </label>
            <input
              id="email"
              name="email"
              type="email"
              defaultValue={cari?.email ?? ""}
              className="input"
            />
          </div>

          <div>
            <label className="label" htmlFor="taxOffice">
              Vergi Dairesi
            </label>
            <input
              id="taxOffice"
              name="taxOffice"
              defaultValue={cari?.taxOffice ?? ""}
              className="input"
            />
          </div>

          <div>
            <label className="label" htmlFor="taxNumber">
              Vergi / TC No
            </label>
            <input
              id="taxNumber"
              name="taxNumber"
              defaultValue={cari?.taxNumber ?? ""}
              className="input"
            />
          </div>

          <div className="md:col-span-2">
            <label className="label" htmlFor="address">
              Adres
            </label>
            <textarea
              id="address"
              name="address"
              rows={2}
              defaultValue={cari?.address ?? ""}
              className="input"
            />
          </div>

          <div className="md:col-span-2">
            <label className="label" htmlFor="notes">
              Notlar
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={2}
              defaultValue={cari?.notes ?? ""}
              className="input"
            />
          </div>

          {cari && (
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
              <input type="hidden" name="aktiflikAlaniVar" value="1" />
              <input
                type="checkbox"
                name="isActive"
                defaultChecked={cari.isActive}
                className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              Aktif
            </label>
          )}
        </div>
      </section>

      <div className="flex items-center gap-3">
        <KaydetButonu />
        <Link href={geriYol} className="btn-secondary">
          Vazgeç
        </Link>
      </div>
    </form>
  );
}
