# Mikro Sızdırmazlık — Stok Takip

Mikro Sızdırmazlık için ürün, stok ve cari takip uygulaması.

## Neler var

- **Ürünler** — tipe özel ölçü alanları (O-Ring → iç çap/kesit çapı gibi) + ürün başına serbest ek özellikler, çoklu resim, malzeme, Shore sertliği, renk
- **Müşteriye özel ürünler** — müşteri, müşteri parça no ve kalıp no bilgisiyle
- **Stok** — giriş / çıkış / sayım hareketleri, kritik stok uyarısı, tek depo
- **Cariler** — müşteri ve tedarikçi kartları
- **Hareket geçmişi** — filtreleme ve Excel (CSV) dışa aktarma
- **Kullanıcılar** — e-posta/şifre ile giriş, herkes aynı yetkide

Fiyatlar bu uygulamada tutulmaz; Wino tarafında yönetilir.

## Teknoloji

Next.js 16 (App Router) · TypeScript · Tailwind v4 · Prisma 7 · Supabase (Postgres + Storage) · Vercel

## Geliştirme

```bash
npm install
cp .env.example .env.local   # değerleri doldurun
npm run db:deploy            # tabloları oluştur
npm run db:seed              # ürün tipleri, malzemeler, ilk kullanıcı
npm run dev
```

## Ortam değişkenleri

| Değişken | Açıklama |
|---|---|
| `DATABASE_URL` | Supabase transaction pooler (port 6543) — uygulama bağlantısı |
| `DIRECT_URL` | Supabase direct connection (port 5432) — migration'lar |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase proje adresi |
| `SUPABASE_SERVICE_ROLE_KEY` | Storage'a sunucu tarafından yazmak için (gizli) |
| `SUPABASE_STORAGE_BUCKET` | Ürün resimlerinin bucket adı (`urun-resimleri`) |
| `AUTH_SECRET` | Oturum çerezini imzalayan gizli anahtar |
| `SEED_ADMIN_*` | `db:seed` ile oluşturulan ilk kullanıcının bilgileri |

## Yararlı komutlar

```bash
npm run db:migrate    # şema değişikliğinden sonra yeni migration
npm run db:studio     # veritabanını tarayıcıda görüntüle
```

## Logo

`public/logo.png` değiştirilirse uygulama her yerde otomatik günceller.
Sekme ikonu (`src/app/icon.png`) ayrıca üretilir.
