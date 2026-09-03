"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadProductImage, deleteProductImage } from "@/lib/storage";
import { formdanSpecs, otomatikKodUret } from "@/lib/urun";
import type { Unit, MovementType } from "@/generated/prisma/enums";

export type FormDurumu = { hata?: string; basarili?: boolean };

const BIRIMLER: Unit[] = ["ADET", "METRE", "KG", "PAKET"];

function metin(formData: FormData, name: string): string | null {
  const v = String(formData.get(name) ?? "").trim();
  return v === "" ? null : v;
}

function sayi(formData: FormData, name: string): number {
  const v = String(formData.get(name) ?? "").trim().replace(",", ".");
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

// ---------------------------------------------------------------------------
// Ürün kaydet (yeni / güncelle)
// ---------------------------------------------------------------------------

export async function urunKaydet(
  _prev: FormDurumu,
  formData: FormData,
): Promise<FormDurumu> {
  const user = await requireUser();

  const id = metin(formData, "id");
  const name = metin(formData, "name");
  const productTypeId = metin(formData, "productTypeId");

  if (!name) return { hata: "Ürün adı zorunlu." };
  if (!productTypeId) return { hata: "Ürün tipi seçilmeli." };

  const unitRaw = String(formData.get("unit") ?? "ADET") as Unit;
  const unit = BIRIMLER.includes(unitRaw) ? unitRaw : "ADET";

  const isCustom = formData.get("isCustom") === "on";
  const customerId = isCustom ? metin(formData, "customerId") : null;

  const veri = {
    name,
    productTypeId,
    materialId: metin(formData, "materialId"),
    hardnessShoreA: metin(formData, "hardnessShoreA")
      ? Math.round(sayi(formData, "hardnessShoreA"))
      : null,
    color: metin(formData, "color"),
    unit,
    minQuantity: sayi(formData, "minQuantity"),
    isCustom,
    customerId,
    customerPartNo: metin(formData, "customerPartNo"),
    moldNo: metin(formData, "moldNo"),
    specs: formdanSpecs(formData) as object,
    notes: metin(formData, "notes"),
    // aktiflik kutusu sadece düzenleme formunda var; yoksa varsayılan aktif
    isActive: formData.has("aktiflikAlaniVar") ? formData.get("isActive") === "on" : true,
  };

  let urunId: string;

  try {
    if (id) {
      const kod = metin(formData, "code");
      const guncel = await prisma.product.update({
        where: { id },
        data: { ...veri, ...(kod ? { code: kod } : {}) },
      });
      urunId = guncel.id;
    } else {
      const kod = metin(formData, "code") ?? (await otomatikKodUret(productTypeId));
      const baslangicStok = sayi(formData, "baslangicStok");

      const yeni = await prisma.product.create({
        data: { ...veri, code: kod, quantity: baslangicStok },
      });
      urunId = yeni.id;

      if (baslangicStok > 0) {
        await prisma.stockMovement.create({
          data: {
            productId: yeni.id,
            type: "GIRIS",
            quantity: baslangicStok,
            balance: baslangicStok,
            note: "Açılış stoğu",
            userId: user.id,
          },
        });
      }
    }
  } catch (e) {
    const mesaj = e instanceof Error ? e.message : "Bilinmeyen hata";
    if (mesaj.includes("Unique constraint") || mesaj.includes("code")) {
      return { hata: "Bu stok kodu zaten kullanılıyor. Farklı bir kod girin." };
    }
    return { hata: `Kaydedilemedi: ${mesaj}` };
  }

  // Resimler
  const resimler = formData.getAll("resimler").filter((f): f is File => f instanceof File && f.size > 0);

  for (const [index, file] of resimler.entries()) {
    try {
      const { url, path } = await uploadProductImage(urunId, file);
      const mevcutSayi = await prisma.productImage.count({ where: { productId: urunId } });
      await prisma.productImage.create({
        data: {
          productId: urunId,
          url,
          path,
          isPrimary: mevcutSayi === 0,
          sortOrder: mevcutSayi + index,
        },
      });
    } catch (e) {
      const mesaj = e instanceof Error ? e.message : "bilinmeyen hata";
      return { hata: `Ürün kaydedildi ancak resim yüklenemedi: ${mesaj}` };
    }
  }

  revalidatePath("/urunler");
  revalidatePath(`/urunler/${urunId}`);
  redirect(`/urunler/${urunId}`);
}

// ---------------------------------------------------------------------------
// Stok hareketi
// ---------------------------------------------------------------------------

export async function stokHareketiEkle(
  _prev: FormDurumu,
  formData: FormData,
): Promise<FormDurumu> {
  const user = await requireUser();

  const productId = metin(formData, "productId");
  const type = String(formData.get("type") ?? "") as MovementType;
  const miktar = sayi(formData, "quantity");

  if (!productId) return { hata: "Ürün bulunamadı." };
  if (!["GIRIS", "CIKIS", "SAYIM"].includes(type)) return { hata: "Hareket tipi geçersiz." };
  if (miktar <= 0 && type !== "SAYIM") return { hata: "Miktar sıfırdan büyük olmalı." };
  if (miktar < 0) return { hata: "Miktar negatif olamaz." };

  try {
    await prisma.$transaction(async (tx) => {
      const urun = await tx.product.findUnique({
        where: { id: productId },
        select: { quantity: true },
      });
      if (!urun) throw new Error("Ürün bulunamadı.");

      const mevcut = Number(urun.quantity);
      let yeniBakiye: number;

      if (type === "GIRIS") yeniBakiye = mevcut + miktar;
      else if (type === "CIKIS") yeniBakiye = mevcut - miktar;
      else yeniBakiye = miktar; // SAYIM: mutlak değere çeker

      if (yeniBakiye < 0) {
        throw new Error(
          `Stok yetersiz. Mevcut: ${mevcut}, çıkış yapılmak istenen: ${miktar}.`,
        );
      }

      await tx.stockMovement.create({
        data: {
          productId,
          type,
          quantity: type === "SAYIM" ? Math.abs(yeniBakiye - mevcut) : miktar,
          balance: yeniBakiye,
          customerId: type === "CIKIS" ? metin(formData, "customerId") : null,
          supplierId: type === "GIRIS" ? metin(formData, "supplierId") : null,
          reference: metin(formData, "reference"),
          note: metin(formData, "note"),
          userId: user.id,
        },
      });

      await tx.product.update({
        where: { id: productId },
        data: { quantity: yeniBakiye },
      });
    });
  } catch (e) {
    return { hata: e instanceof Error ? e.message : "Hareket kaydedilemedi." };
  }

  revalidatePath("/urunler");
  revalidatePath(`/urunler/${productId}`);
  revalidatePath("/hareketler");
  revalidatePath("/");
  return { basarili: true };
}

// ---------------------------------------------------------------------------
// Resim işlemleri
// ---------------------------------------------------------------------------

export async function resimSil(formData: FormData) {
  await requireUser();
  const imageId = String(formData.get("imageId") ?? "");
  const productId = String(formData.get("productId") ?? "");

  const resim = await prisma.productImage.findUnique({ where: { id: imageId } });
  if (!resim) return;

  await deleteProductImage(resim.path).catch(() => {
    /* storage'da yoksa yine de kaydı silelim */
  });
  await prisma.productImage.delete({ where: { id: imageId } });

  // birincil resim silindiyse ilk kalanı birincil yap
  if (resim.isPrimary) {
    const kalan = await prisma.productImage.findFirst({
      where: { productId },
      orderBy: { sortOrder: "asc" },
    });
    if (kalan) {
      await prisma.productImage.update({ where: { id: kalan.id }, data: { isPrimary: true } });
    }
  }

  revalidatePath(`/urunler/${productId}`);
}

export async function resimBirincilYap(formData: FormData) {
  await requireUser();
  const imageId = String(formData.get("imageId") ?? "");
  const productId = String(formData.get("productId") ?? "");

  await prisma.$transaction([
    prisma.productImage.updateMany({ where: { productId }, data: { isPrimary: false } }),
    prisma.productImage.update({ where: { id: imageId }, data: { isPrimary: true } }),
  ]);

  revalidatePath(`/urunler/${productId}`);
  revalidatePath("/urunler");
}

// ---------------------------------------------------------------------------
// Ürün pasife alma
// Not: ürünler kalıcı olarak silinmez, sadece pasife alınır
// ---------------------------------------------------------------------------

export async function urunDurumDegistir(formData: FormData) {
  await requireUser();
  const id = String(formData.get("id") ?? "");
  const urun = await prisma.product.findUnique({ where: { id }, select: { isActive: true } });
  if (!urun) return;

  await prisma.product.update({ where: { id }, data: { isActive: !urun.isActive } });
  revalidatePath("/urunler");
  revalidatePath(`/urunler/${id}`);
}
