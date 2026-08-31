import Link from "next/link";
import Image from "next/image";
import { Plus, Package, AlertTriangle, ImageOff } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { miktarBirim } from "@/lib/format";
import UrunFiltreleri from "./urun-filtreleri";
import type { Prisma } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";
export const metadata = { title: "Ürünler — Mikro Stok Takip" };

export default async function UrunlerSayfasi({ searchParams }: PageProps<"/urunler">) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const tip = typeof params.tip === "string" ? params.tip : "";
  const malzeme = typeof params.malzeme === "string" ? params.malzeme : "";
  const musteri = typeof params.musteri === "string" ? params.musteri : "";
  const kritik = params.kritik === "1";
  const pasif = params.pasif === "1";

  const where: Prisma.ProductWhereInput = {
    isActive: pasif ? false : true,
    ...(tip ? { productTypeId: tip } : {}),
    ...(malzeme ? { materialId: malzeme } : {}),
    ...(musteri ? { customerId: musteri } : {}),
    ...(kritik
      ? { minQuantity: { gt: 0 }, quantity: { lte: prisma.product.fields.minQuantity } }
      : {}),
    ...(q
      ? {
          OR: [
            { code: { contains: q, mode: "insensitive" } },
            { name: { contains: q, mode: "insensitive" } },
            { customerPartNo: { contains: q, mode: "insensitive" } },
            { moldNo: { contains: q, mode: "insensitive" } },
            { color: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [urunler, tipler, malzemeler, musteriler] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        productType: { select: { name: true } },
        material: { select: { name: true } },
        customer: { select: { name: true } },
        images: { where: { isPrimary: true }, take: 1 },
      },
      orderBy: [{ name: "asc" }],
      take: 500,
    }),
    prisma.productType.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.material.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.customer.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Ürünler</h1>
          <p className="mt-1 text-sm text-slate-500">
            {urunler.length} ürün listeleniyor
            {urunler.length === 500 ? " (ilk 500)" : ""}
          </p>
        </div>
        <Link href="/urunler/yeni" className="btn-primary">
          <Plus className="h-4 w-4" />
          Yeni Ürün
        </Link>
      </div>

      <UrunFiltreleri
        tipler={tipler.map((t) => ({ id: t.id, name: t.name }))}
        malzemeler={malzemeler.map((m) => ({ id: m.id, name: m.name }))}
        musteriler={musteriler.map((m) => ({ id: m.id, name: m.name }))}
      />

      {urunler.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 px-6 py-16 text-center">
          <Package className="h-10 w-10 text-slate-300" />
          <p className="text-sm text-slate-500">
            Kritere uyan ürün bulunamadı.
          </p>
          <Link href="/urunler/yeni" className="btn-secondary">
            <Plus className="h-4 w-4" />
            İlk ürünü ekle
          </Link>
        </div>
      ) : (
        <div className="card table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th className="w-14"></th>
                <th>Stok Kodu</th>
                <th>Ürün</th>
                <th>Tip</th>
                <th>Malzeme</th>
                <th>Müşteri</th>
                <th className="text-right">Stok</th>
              </tr>
            </thead>
            <tbody>
              {urunler.map((u) => {
                const min = Number(u.minQuantity);
                const kritikMi = min > 0 && Number(u.quantity) <= min;
                const resim = u.images[0];

                return (
                  <tr key={u.id} className="cursor-pointer">
                    <td>
                      <Link href={`/urunler/${u.id}`} className="block">
                        {resim ? (
                          <Image
                            src={resim.url}
                            alt={u.name}
                            width={40}
                            height={40}
                            className="h-10 w-10 rounded-md object-cover ring-1 ring-slate-200"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-slate-300">
                            <ImageOff className="h-4 w-4" />
                          </div>
                        )}
                      </Link>
                    </td>
                    <td>
                      <Link href={`/urunler/${u.id}`} className="font-mono text-xs text-slate-500">
                        {u.code}
                      </Link>
                    </td>
                    <td>
                      <Link href={`/urunler/${u.id}`} className="block">
                        <span className="font-medium text-slate-900">{u.name}</span>
                        {u.isCustom && (
                          <span className="badge ml-2 bg-violet-50 text-violet-700">özel</span>
                        )}
                        {(u.hardnessShoreA || u.color) && (
                          <div className="text-xs text-slate-400">
                            {[u.hardnessShoreA ? `${u.hardnessShoreA} Sh` : null, u.color]
                              .filter(Boolean)
                              .join(" · ")}
                          </div>
                        )}
                      </Link>
                    </td>
                    <td className="text-slate-500">{u.productType.name}</td>
                    <td className="text-slate-500">{u.material?.name ?? "—"}</td>
                    <td className="text-slate-500">{u.customer?.name ?? "—"}</td>
                    <td className="text-right">
                      <span
                        className={`inline-flex items-center gap-1 font-semibold ${
                          kritikMi ? "text-amber-600" : "text-slate-900"
                        }`}
                      >
                        {kritikMi && <AlertTriangle className="h-3.5 w-3.5" />}
                        {miktarBirim(u.quantity, u.unit)}
                      </span>
                      {min > 0 && (
                        <div className="text-xs text-slate-400">
                          min. {miktarBirim(u.minQuantity, u.unit)}
                        </div>
                      )}
                    </td>
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
