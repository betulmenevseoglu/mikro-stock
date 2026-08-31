"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { AlertCircle, Plus, Save, Trash2, ImagePlus } from "lucide-react";
import { urunKaydet, type FormDurumu } from "@/app/(app)/urunler/actions";
import type { EkOzellik } from "@/lib/urun";

export type TipAlani = {
  key: string;
  label: string;
  type: "NUMBER" | "TEXT" | "SELECT";
  unit: string | null;
  options: string[];
  required: boolean;
};

export type TipSecenegi = { id: string; name: string; fields: TipAlani[] };
export type Secenek = { id: string; name: string };

export type UrunVarsayilan = {
  id: string;
  code: string;
  name: string;
  productTypeId: string;
  materialId: string | null;
  hardnessShoreA: number | null;
  color: string | null;
  unit: string;
  minQuantity: number;
  isCustom: boolean;
  customerId: string | null;
  customerPartNo: string | null;
  moldNo: string | null;
  notes: string | null;
  isActive: boolean;
  specs: Record<string, string>;
  ekOzellikler: EkOzellik[];
};

function KaydetButonu({ yeni }: { yeni: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      <Save className="h-4 w-4" />
      {pending ? "Kaydediliyor..." : yeni ? "Ürünü Kaydet" : "Değişiklikleri Kaydet"}
    </button>
  );
}

export default function UrunFormu({
  tipler,
  malzemeler,
  musteriler,
  urun,
}: {
  tipler: TipSecenegi[];
  malzemeler: Secenek[];
  musteriler: Secenek[];
  urun?: UrunVarsayilan;
}) {
  const yeni = !urun;
  const [durum, formAction] = useActionState<FormDurumu, FormData>(urunKaydet, {});

  const [tipId, setTipId] = useState(urun?.productTypeId ?? tipler[0]?.id ?? "");
  const [ozelMi, setOzelMi] = useState(urun?.isCustom ?? false);
  const [ekler, setEkler] = useState<EkOzellik[]>(urun?.ekOzellikler ?? []);

  const seciliTip = useMemo(() => tipler.find((t) => t.id === tipId), [tipler, tipId]);

  return (
    <form action={formAction} className="space-y-5">
      {urun && <input type="hidden" name="id" value={urun.id} />}

      {durum.hata && (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{durum.hata}</span>
        </div>
      )}

      {/* --- Temel bilgiler --- */}
      <section className="card p-5">
        <h2 className="mb-4 font-semibold text-slate-900">Temel Bilgiler</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="label" htmlFor="name">
              Ürün Adı *
            </label>
            <input
              id="name"
              name="name"
              required
              defaultValue={urun?.name}
              className="input"
              placeholder="Örn: O-Ring 25x3 Silikon"
            />
          </div>

          <div>
            <label className="label" htmlFor="code">
              Stok Kodu
            </label>
            <input
              id="code"
              name="code"
              defaultValue={urun?.code}
              className="input font-mono"
              placeholder={yeni ? "Boş bırakırsanız otomatik üretilir" : ""}
            />
          </div>

          <div>
            <label className="label" htmlFor="productTypeId">
              Ürün Tipi *
            </label>
            <select
              id="productTypeId"
              name="productTypeId"
              required
              value={tipId}
              onChange={(e) => setTipId(e.target.value)}
              className="input"
            >
              {tipler.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label" htmlFor="materialId">
              Malzeme
            </label>
            <select
              id="materialId"
              name="materialId"
              defaultValue={urun?.materialId ?? ""}
              className="input"
            >
              <option value="">Seçilmedi</option>
              {malzemeler.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label" htmlFor="hardnessShoreA">
              Sertlik (Shore A)
            </label>
            <input
              id="hardnessShoreA"
              name="hardnessShoreA"
              type="number"
              min={0}
              max={100}
              defaultValue={urun?.hardnessShoreA ?? ""}
              className="input"
              placeholder="Örn: 70"
            />
          </div>

          <div>
            <label className="label" htmlFor="color">
              Renk
            </label>
            <input
              id="color"
              name="color"
              defaultValue={urun?.color ?? ""}
              className="input"
              placeholder="Örn: Şeffaf, Beyaz, Siyah"
            />
          </div>
        </div>
      </section>

      {/* --- Tipe özel ölçüler --- */}
      <section className="card p-5">
        <h2 className="mb-1 font-semibold text-slate-900">Ölçüler ve Özellikler</h2>
        <p className="mb-4 text-sm text-slate-500">
          {seciliTip?.name} için tanımlı alanlar. Eksik kalan alanları boş bırakabilirsiniz.
        </p>

        {seciliTip && seciliTip.fields.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-3">
            {seciliTip.fields.map((f) => (
              <div key={f.key}>
                <label className="label" htmlFor={`spec_${f.key}`}>
                  {f.label}
                  {f.unit && <span className="ml-1 font-normal text-slate-400">({f.unit})</span>}
                </label>

                {f.type === "SELECT" ? (
                  <select
                    id={`spec_${f.key}`}
                    name={`spec_${f.key}`}
                    defaultValue={urun?.specs[f.key] ?? ""}
                    className="input"
                  >
                    <option value="">Seçilmedi</option>
                    {f.options.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={`spec_${f.key}`}
                    name={`spec_${f.key}`}
                    type={f.type === "NUMBER" ? "text" : "text"}
                    inputMode={f.type === "NUMBER" ? "decimal" : undefined}
                    defaultValue={urun?.specs[f.key] ?? ""}
                    className="input"
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">
            Bu tip için tanımlı alan yok. Aşağıdan istediğiniz özelliği ekleyebilirsiniz.
          </p>
        )}

        {/* Ek serbest özellikler */}
        <div className="mt-6 border-t border-slate-100 pt-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-medium text-slate-700">Ek Özellikler</h3>
            <button
              type="button"
              onClick={() => setEkler([...ekler, { label: "", value: "" }])}
              className="btn-secondary py-1.5 text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              Özellik Ekle
            </button>
          </div>

          {ekler.length === 0 ? (
            <p className="text-sm text-slate-400">
              Tanımlı alanların dışında bir bilgi eklemek isterseniz &quot;Özellik Ekle&quot;ye basın.
            </p>
          ) : (
            <div className="space-y-2">
              {ekler.map((ek, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    name="ekOzellikAd"
                    defaultValue={ek.label}
                    placeholder="Özellik adı (örn. Sıcaklık Aralığı)"
                    className="input flex-1"
                  />
                  <input
                    name="ekOzellikDeger"
                    defaultValue={ek.value}
                    placeholder="Değer (örn. -60 / +200 °C)"
                    className="input flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => setEkler(ekler.filter((_, j) => j !== i))}
                    className="btn-secondary px-3"
                    aria-label="Sil"
                  >
                    <Trash2 className="h-4 w-4 text-slate-400" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* --- Stok --- */}
      <section className="card p-5">
        <h2 className="mb-4 font-semibold text-slate-900">Stok</h2>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="label" htmlFor="unit">
              Birim *
            </label>
            <select id="unit" name="unit" defaultValue={urun?.unit ?? "ADET"} className="input">
              <option value="ADET">Adet</option>
              <option value="METRE">Metre</option>
              <option value="KG">Kilogram</option>
              <option value="PAKET">Paket</option>
            </select>
          </div>

          {yeni && (
            <div>
              <label className="label" htmlFor="baslangicStok">
                Açılış Stoğu
              </label>
              <input
                id="baslangicStok"
                name="baslangicStok"
                inputMode="decimal"
                defaultValue="0"
                className="input"
              />
            </div>
          )}

          <div>
            <label className="label" htmlFor="minQuantity">
              Kritik Stok Seviyesi
            </label>
            <input
              id="minQuantity"
              name="minQuantity"
              inputMode="decimal"
              defaultValue={urun?.minQuantity ?? 0}
              className="input"
            />
            <p className="mt-1 text-xs text-slate-400">
              Stok bu değerin altına inince panelde uyarı çıkar. 0 = uyarı yok.
            </p>
          </div>
        </div>
      </section>

      {/* --- Müşteriye özel --- */}
      <section className="card p-5">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            name="isCustom"
            checked={ozelMi}
            onChange={(e) => setOzelMi(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
          />
          <span className="font-semibold text-slate-900">Müşteriye özel ürün</span>
        </label>
        <p className="mt-1 text-sm text-slate-500">
          Belirli bir müşteri için üretilen, kataloğa girmeyen ürünler.
        </p>

        {ozelMi && (
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div>
              <label className="label" htmlFor="customerId">
                Müşteri
              </label>
              <select
                id="customerId"
                name="customerId"
                defaultValue={urun?.customerId ?? ""}
                className="input"
              >
                <option value="">Seçilmedi</option>
                {musteriler.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
              {musteriler.length === 0 && (
                <p className="mt-1 text-xs text-slate-400">
                  Henüz müşteri yok.{" "}
                  <Link href="/musteriler/yeni" className="text-sky-600 hover:underline">
                    Müşteri ekle
                  </Link>
                </p>
              )}
            </div>

            <div>
              <label className="label" htmlFor="customerPartNo">
                Müşteri Parça No
              </label>
              <input
                id="customerPartNo"
                name="customerPartNo"
                defaultValue={urun?.customerPartNo ?? ""}
                className="input"
              />
            </div>

            <div>
              <label className="label" htmlFor="moldNo">
                Kalıp No
              </label>
              <input
                id="moldNo"
                name="moldNo"
                defaultValue={urun?.moldNo ?? ""}
                className="input"
              />
            </div>
          </div>
        )}
      </section>

      {/* --- Resimler & not --- */}
      <section className="card p-5">
        <h2 className="mb-4 font-semibold text-slate-900">Resimler ve Notlar</h2>

        <div className="space-y-4">
          <div>
            <label className="label" htmlFor="resimler">
              Ürün Resimleri
            </label>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500 transition hover:border-sky-400 hover:bg-sky-50/50">
              <ImagePlus className="h-5 w-5" />
              Resim seçmek için tıklayın (birden fazla seçebilirsiniz)
              <input
                id="resimler"
                name="resimler"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  const adet = e.target.files?.length ?? 0;
                  const bilgi = document.getElementById("resim-bilgi");
                  if (bilgi) bilgi.textContent = adet > 0 ? `${adet} resim seçildi` : "";
                }}
              />
            </label>
            <p id="resim-bilgi" className="mt-1 text-xs text-sky-600"></p>
          </div>

          <div>
            <label className="label" htmlFor="notes">
              Notlar
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              defaultValue={urun?.notes ?? ""}
              className="input"
              placeholder="Üretim notu, tolerans, özel talimat..."
            />
          </div>

          {!yeni && (
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
              <input type="hidden" name="aktiflikAlaniVar" value="1" />
              <input
                type="checkbox"
                name="isActive"
                defaultChecked={urun?.isActive}
                className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              Ürün aktif
            </label>
          )}
        </div>
      </section>

      <div className="flex items-center gap-3">
        <KaydetButonu yeni={yeni} />
        <Link href={urun ? `/urunler/${urun.id}` : "/urunler"} className="btn-secondary">
          Vazgeç
        </Link>
      </div>
    </form>
  );
}
