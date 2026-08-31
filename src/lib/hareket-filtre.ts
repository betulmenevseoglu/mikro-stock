import type { Prisma, MovementType } from "@/generated/prisma/client";

type Params = Record<string, string | string[] | undefined>;

function tekil(params: Params, key: string): string {
  const v = params[key];
  return typeof v === "string" ? v : "";
}

/** Hareket listesi ve CSV dışa aktarma aynı filtreyi kullanır. */
export function hareketWhere(params: Params): Prisma.StockMovementWhereInput {
  const tip = tekil(params, "tip");
  const urun = tekil(params, "urun");
  const musteri = tekil(params, "musteri");
  const tedarikci = tekil(params, "tedarikci");
  const baslangic = tekil(params, "baslangic");
  const bitis = tekil(params, "bitis");

  const tarih: Prisma.DateTimeFilter = {};
  if (baslangic) tarih.gte = new Date(`${baslangic}T00:00:00`);
  if (bitis) tarih.lte = new Date(`${bitis}T23:59:59.999`);

  return {
    ...(["GIRIS", "CIKIS", "SAYIM"].includes(tip) ? { type: tip as MovementType } : {}),
    ...(urun ? { productId: urun } : {}),
    ...(musteri ? { customerId: musteri } : {}),
    ...(tedarikci ? { supplierId: tedarikci } : {}),
    ...(baslangic || bitis ? { createdAt: tarih } : {}),
  };
}
