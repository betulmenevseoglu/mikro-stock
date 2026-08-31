"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { FieldType } from "@/generated/prisma/enums";

export type AyarDurumu = { hata?: string; basarili?: string };

function metin(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

function slugla(text: string): string {
  const harita: Record<string, string> = {
    ç: "c", Ç: "c", ğ: "g", Ğ: "g", ı: "i", İ: "i",
    ö: "o", Ö: "o", ş: "s", Ş: "s", ü: "u", Ü: "u",
  };
  return text
    .split("")
    .map((c) => harita[c] ?? c)
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// --- Kullanıcılar ----------------------------------------------------------

export async function kullaniciEkle(_prev: AyarDurumu, formData: FormData): Promise<AyarDurumu> {
  await requireUser();

  const name = metin(formData, "name");
  const email = metin(formData, "email").toLowerCase();
  const sifre = metin(formData, "sifre");

  if (!name || !email) return { hata: "Ad ve e-posta zorunlu." };
  if (sifre.length < 6) return { hata: "Şifre en az 6 karakter olmalı." };

  const mevcut = await prisma.user.findUnique({ where: { email } });
  if (mevcut) return { hata: "Bu e-posta ile kayıtlı bir kullanıcı zaten var." };

  await prisma.user.create({
    data: { name, email, passwordHash: await bcrypt.hash(sifre, 10) },
  });

  revalidatePath("/ayarlar/kullanicilar");
  return { basarili: `${name} eklendi.` };
}

export async function sifreDegistir(_prev: AyarDurumu, formData: FormData): Promise<AyarDurumu> {
  await requireUser();

  const id = metin(formData, "id");
  const sifre = metin(formData, "sifre");

  if (sifre.length < 6) return { hata: "Şifre en az 6 karakter olmalı." };

  await prisma.user.update({
    where: { id },
    data: { passwordHash: await bcrypt.hash(sifre, 10) },
  });

  revalidatePath("/ayarlar/kullanicilar");
  return { basarili: "Şifre güncellendi." };
}

export async function kullaniciDurumDegistir(formData: FormData) {
  const oturum = await requireUser();
  const id = String(formData.get("id") ?? "");

  // kendini pasife alıp sistemden kilitlenmeyi engelle
  if (id === oturum.id) return;

  const kullanici = await prisma.user.findUnique({ where: { id }, select: { isActive: true } });
  if (!kullanici) return;

  await prisma.user.update({ where: { id }, data: { isActive: !kullanici.isActive } });
  revalidatePath("/ayarlar/kullanicilar");
}

// --- Malzemeler ------------------------------------------------------------

export async function malzemeKaydet(_prev: AyarDurumu, formData: FormData): Promise<AyarDurumu> {
  await requireUser();

  const id = metin(formData, "id");
  const name = metin(formData, "name");
  if (!name) return { hata: "Malzeme adı zorunlu." };

  const veri = {
    name,
    code: metin(formData, "code") || null,
    foodGrade: formData.get("foodGrade") === "on",
    notes: metin(formData, "notes") || null,
  };

  try {
    if (id) await prisma.material.update({ where: { id }, data: veri });
    else await prisma.material.create({ data: veri });
  } catch {
    return { hata: "Bu malzeme adı zaten kayıtlı." };
  }

  revalidatePath("/ayarlar/malzemeler");
  return { basarili: id ? "Malzeme güncellendi." : `${name} eklendi.` };
}

export async function malzemeDurumDegistir(formData: FormData) {
  await requireUser();
  const id = String(formData.get("id") ?? "");
  const malzeme = await prisma.material.findUnique({ where: { id }, select: { isActive: true } });
  if (!malzeme) return;

  await prisma.material.update({ where: { id }, data: { isActive: !malzeme.isActive } });
  revalidatePath("/ayarlar/malzemeler");
}

// --- Ürün tipleri ----------------------------------------------------------

export async function urunTipiEkle(_prev: AyarDurumu, formData: FormData): Promise<AyarDurumu> {
  await requireUser();

  const name = metin(formData, "name");
  if (!name) return { hata: "Tip adı zorunlu." };

  const slug = slugla(name);
  const mevcut = await prisma.productType.findFirst({ where: { OR: [{ name }, { slug }] } });
  if (mevcut) return { hata: "Bu ürün tipi zaten var." };

  const sonSira = await prisma.productType.count();
  await prisma.productType.create({ data: { name, slug, sortOrder: sonSira } });

  revalidatePath("/ayarlar/urun-tipleri");
  return { basarili: `${name} eklendi.` };
}

export async function tipAlaniEkle(_prev: AyarDurumu, formData: FormData): Promise<AyarDurumu> {
  await requireUser();

  const productTypeId = metin(formData, "productTypeId");
  const label = metin(formData, "label");
  if (!productTypeId || !label) return { hata: "Alan adı zorunlu." };

  const key = slugla(label).replace(/-/g, "_");
  if (!key) return { hata: "Alan adı geçersiz." };

  const mevcut = await prisma.productTypeField.findUnique({
    where: { productTypeId_key: { productTypeId, key } },
  });
  if (mevcut) return { hata: "Bu alan zaten tanımlı." };

  const tip = (metin(formData, "type") || "NUMBER") as FieldType;
  const secenekler = metin(formData, "options")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const sonSira = await prisma.productTypeField.count({ where: { productTypeId } });

  await prisma.productTypeField.create({
    data: {
      productTypeId,
      key,
      label,
      type: tip,
      unit: metin(formData, "unit") || null,
      options: tip === "SELECT" ? secenekler : [],
      sortOrder: sonSira,
    },
  });

  revalidatePath("/ayarlar/urun-tipleri");
  return { basarili: `"${label}" alanı eklendi.` };
}

export async function tipAlaniSil(formData: FormData) {
  await requireUser();
  const id = String(formData.get("id") ?? "");
  await prisma.productTypeField.delete({ where: { id } });
  revalidatePath("/ayarlar/urun-tipleri");
}

export async function urunTipiDurumDegistir(formData: FormData) {
  await requireUser();
  const id = String(formData.get("id") ?? "");
  const tip = await prisma.productType.findUnique({ where: { id }, select: { isActive: true } });
  if (!tip) return;

  await prisma.productType.update({ where: { id }, data: { isActive: !tip.isActive } });
  revalidatePath("/ayarlar/urun-tipleri");
}
