import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, ClipboardList } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { miktarFormat, tarihSaatFormat, HAREKET_ETIKET, BIRIM_ETIKET } from "@/lib/format";
import { hareketWhere } from "@/lib/hareket-filtre";
import HareketFiltreleri from "./hareket-filtreleri";

export const dynamic = "force-dynamic";
export const metadata = { title: "Stok Hareketleri — Mikro Stok Takip" };

export default async function HareketlerSayfasi({ searchParams }: PageProps<"/hareketler">) {
  const params = await searchParams;
  const where = hareketWhere(params);

  const [hareketler, musteriler, tedarikciler] = await Promise.all([
    prisma.stockMovement.findMany({
      where,
      include: {
        product: { select: { id: true, code: true, name: true, unit: true } },
        user: { select: { name: true } },
        customer: { select: { name: true } },
        supplier: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 500,
    }),
    prisma.customer.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.supplier.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Stok Hareketleri</h1>
        <p className="mt-1 text-sm text-slate-500">
          {hareketler.length} hareket{hareketler.length === 500 ? " (son 500)" : ""}
        </p>
      </div>

      <HareketFiltreleri
        musteriler={musteriler.map((m) => ({ id: m.id, name: m.name }))}
        tedarikciler={tedarikciler.map((t) => ({ id: t.id, name: t.name }))}
      />

      {hareketler.length === 0 ? (
        <div className="card px-6 py-16 text-center">
          <ClipboardList className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <p className="text-sm text-slate-500">Kritere uyan hareket bulunamadı.</p>
        </div>
      ) : (
        <div className="card table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Tarih</th>
                <th>Ürün</th>
                <th>Tip</th>
                <th className="text-right">Miktar</th>
                <th className="text-right">Kalan</th>
                <th>Cari</th>
                <th>İrsaliye / Açıklama</th>
                <th>Kullanıcı</th>
              </tr>
            </thead>
            <tbody>
              {hareketler.map((h) => {
                const Icon =
                  h.type === "GIRIS" ? ArrowDownLeft : h.type === "CIKIS" ? ArrowUpRight : ClipboardList;
                const renk =
                  h.type === "GIRIS"
                    ? "text-emerald-600"
                    : h.type === "CIKIS"
                      ? "text-red-600"
                      : "text-slate-500";
                return (
                  <tr key={h.id}>
                    <td className="whitespace-nowrap text-slate-500">{tarihSaatFormat(h.createdAt)}</td>
                    <td>
                      <Link href={`/urunler/${h.product.id}`} className="font-medium text-slate-900">
                        {h.product.name}
                      </Link>
                      <div className="font-mono text-xs text-slate-400">{h.product.code}</div>
                    </td>
                    <td>
                      <span className={`inline-flex items-center gap-1 font-medium ${renk}`}>
                        <Icon className="h-3.5 w-3.5" />
                        {HAREKET_ETIKET[h.type]}
                      </span>
                    </td>
                    <td className={`whitespace-nowrap text-right font-medium ${renk}`}>
                      {h.type === "CIKIS" ? "−" : h.type === "GIRIS" ? "+" : ""}
                      {miktarFormat(h.quantity)} {BIRIM_ETIKET[h.product.unit]}
                    </td>
                    <td className="text-right text-slate-500">{miktarFormat(h.balance)}</td>
                    <td className="text-slate-500">{h.customer?.name ?? h.supplier?.name ?? "—"}</td>
                    <td className="text-slate-500">
                      {h.reference && <div>{h.reference}</div>}
                      {h.note && <div className="text-xs text-slate-400">{h.note}</div>}
                      {!h.reference && !h.note && "—"}
                    </td>
                    <td className="text-slate-500">{h.user.name}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
