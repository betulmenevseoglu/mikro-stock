"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type CariDurumu = { hata?: string };

function metin(formData: FormData, name: string): string | null {
  const v = String(formData.get(name) ?? "").trim();
  return v === "" ? null : v;
}

function cariVerisi(formData: FormData) {
  return {
    code: metin(formData, "code"),
    contactName: metin(formData, "contactName"),
    phone: metin(formData, "phone"),
    email: metin(formData, "email"),
    address: metin(formData, "address"),
    taxOffice: metin(formData, "taxOffice"),
    taxNumber: metin(formData, "taxNumber"),
    notes: metin(formData, "notes"),
    isActive: formData.has("aktiflikAlaniVar") ? formData.get("isActive") === "on" : true,
  };
}

async function cariKaydet(
  tur: "musteri" | "tedarikci",
  formData: FormData,
): Promise<CariDurumu> {
  await requireUser();

  const id = metin(formData, "id");
  const name = metin(formData, "name");
  if (!name) return { hata: "Ünvan / firma adı zorunlu." };

  const veri = { name, ...cariVerisi(formData) };
  const yol = tur === "musteri" ? "/musteriler" : "/tedarikciler";

  try {
    if (tur === "musteri") {
      if (id) await prisma.customer.update({ where: { id }, data: veri });
      else await prisma.customer.create({ data: veri });
    } else {
      if (id) await prisma.supplier.update({ where: { id }, data: veri });
      else await prisma.supplier.create({ data: veri });
    }
  } catch (e) {
    const mesaj = e instanceof Error ? e.message : "Bilinmeyen hata";
    if (mesaj.includes("Unique constraint")) {
      return { hata: "Bu cari kodu zaten kullanılıyor." };
    }
    return { hata: `Kaydedilemedi: ${mesaj}` };
  }

  revalidatePath(yol);
  redirect(yol);
}

export async function musteriKaydet(_prev: CariDurumu, formData: FormData) {
  return cariKaydet("musteri", formData);
}

export async function tedarikciKaydet(_prev: CariDurumu, formData: FormData) {
  return cariKaydet("tedarikci", formData);
}

export async function musteriSil(formData: FormData) {
  await requireUser();
  const id = String(formData.get("id") ?? "");

  // Bağlı ürün/hareket varsa silmek yerine pasife alıyoruz
  const bagli = await prisma.product.count({ where: { customerId: id } });
  const hareket = await prisma.stockMovement.count({ where: { customerId: id } });

  if (bagli > 0 || hareket > 0) {
    await prisma.customer.update({ where: { id }, data: { isActive: false } });
  } else {
    await prisma.customer.delete({ where: { id } });
  }

  revalidatePath("/musteriler");
  redirect("/musteriler");
}

export async function tedarikciSil(formData: FormData) {
  await requireUser();
  const id = String(formData.get("id") ?? "");

  const bagli = await prisma.productSupplier.count({ where: { supplierId: id } });
  const hareket = await prisma.stockMovement.count({ where: { supplierId: id } });

  if (bagli > 0 || hareket > 0) {
    await prisma.supplier.update({ where: { id }, data: { isActive: false } });
  } else {
    await prisma.supplier.delete({ where: { id } });
  }

  revalidatePath("/tedarikciler");
  redirect("/tedarikciler");
}
