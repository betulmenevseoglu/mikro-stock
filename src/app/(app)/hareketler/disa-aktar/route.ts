import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { hareketWhere } from "@/lib/hareket-filtre";
import { HAREKET_ETIKET, BIRIM_ETIKET, tarihSaatFormat } from "@/lib/format";

/** Excel'in Türkçe yerelinde düzgün açılması için ; ayraçlı, BOM'lu CSV üretir. */
function csvHucre(value: unknown): string {
  const s = value === null || value === undefined ? "" : String(value);
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ hata: "Yetkisiz" }, { status: 401 });

  const params = Object.fromEntries(request.nextUrl.searchParams.entries());

  const hareketler = await prisma.stockMovement.findMany({
    where: hareketWhere(params),
    include: {
      product: { select: { code: true, name: true, unit: true } },
      user: { select: { name: true } },
      customer: { select: { name: true } },
      supplier: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 10000,
  });

  const basliklar = [
    "Tarih",
    "Stok Kodu",
    "Ürün",
    "Hareket Tipi",
    "Miktar",
    "Birim",
    "Kalan Stok",
    "Müşteri",
    "Tedarikçi",
    "İrsaliye/Referans",
    "Açıklama",
    "Kullanıcı",
  ];

  const satirlar = hareketler.map((h) =>
    [
      tarihSaatFormat(h.createdAt),
      h.product.code,
      h.product.name,
      HAREKET_ETIKET[h.type],
      String(h.quantity).replace(".", ","),
      BIRIM_ETIKET[h.product.unit],
      String(h.balance).replace(".", ","),
      h.customer?.name ?? "",
      h.supplier?.name ?? "",
      h.reference ?? "",
      h.note ?? "",
      h.user.name,
    ].map(csvHucre).join(";"),
  );

  const csv = "﻿" + [basliklar.map(csvHucre).join(";"), ...satirlar].join("\r\n");
  const dosyaAdi = `stok-hareketleri-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${dosyaAdi}"`,
    },
  });
}
