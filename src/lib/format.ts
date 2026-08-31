import type { Unit, MovementType } from "@/generated/prisma/enums";

export const BIRIM_ETIKET: Record<Unit, string> = {
  ADET: "adet",
  METRE: "m",
  KG: "kg",
  PAKET: "paket",
};

export const HAREKET_ETIKET: Record<MovementType, string> = {
  GIRIS: "Giriş",
  CIKIS: "Çıkış",
  SAYIM: "Sayım",
};

/** Decimal/number/string miktarı Türkçe biçimde gösterir (gereksiz sıfırları atar). */
export function miktarFormat(value: unknown): string {
  const n = Number(value ?? 0);
  if (!Number.isFinite(n)) return "0";
  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  }).format(n);
}

export function miktarBirim(value: unknown, unit: Unit): string {
  return `${miktarFormat(value)} ${BIRIM_ETIKET[unit]}`;
}

export function tarihFormat(date: Date | string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export function tarihSaatFormat(date: Date | string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

/** Prisma Decimal alanlarını client component'e geçirmeden önce sayıya çevirir. */
export function toNumber(value: unknown): number {
  return Number(value ?? 0);
}
