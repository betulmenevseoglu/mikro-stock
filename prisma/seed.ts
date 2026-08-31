import { config } from "dotenv";
config({ path: ".env.local" });
config();

import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DIRECT_URL }),
});

type FieldSeed = {
  key: string;
  label: string;
  type?: "NUMBER" | "TEXT" | "SELECT";
  unit?: string;
  options?: string[];
};

const PRODUCT_TYPES: { name: string; slug: string; fields: FieldSeed[] }[] = [
  {
    name: "O-Ring",
    slug: "o-ring",
    fields: [
      { key: "icCap", label: "İç Çap", unit: "mm" },
      { key: "kesitCapi", label: "Kesit Çapı", unit: "mm" },
      { key: "standart", label: "Standart", type: "TEXT" },
    ],
  },
  {
    name: "Silikon Hortum",
    slug: "silikon-hortum",
    fields: [
      { key: "icCap", label: "İç Çap", unit: "mm" },
      { key: "disCap", label: "Dış Çap", unit: "mm" },
      { key: "etKalinligi", label: "Et Kalınlığı", unit: "mm" },
      { key: "uzunluk", label: "Uzunluk", unit: "m" },
      { key: "takviye", label: "Takviye", type: "SELECT", options: ["Yok", "Örgülü", "Telli", "Spiralli"] },
    ],
  },
  {
    name: "Havalı Şişme Conta",
    slug: "havali-sisme-conta",
    fields: [
      { key: "genislik", label: "Genişlik", unit: "mm" },
      { key: "yukseklik", label: "Yükseklik", unit: "mm" },
      { key: "uzunluk", label: "Uzunluk", unit: "mm" },
      { key: "calismaBasinci", label: "Çalışma Basıncı", unit: "bar" },
      { key: "sismeYonu", label: "Şişme Yönü", type: "SELECT", options: ["Radyal", "Eksenel", "İçe", "Dışa"] },
    ],
  },
  {
    name: "Conta / Sızdırmazlık Elemanı",
    slug: "conta",
    fields: [
      { key: "disCap", label: "Dış Çap", unit: "mm" },
      { key: "icCap", label: "İç Çap", unit: "mm" },
      { key: "kalinlik", label: "Kalınlık", unit: "mm" },
      { key: "sekil", label: "Şekil", type: "SELECT", options: ["Yuvarlak", "Kare", "Dikdörtgen", "Özel Form"] },
    ],
  },
  {
    name: "Profil / Fitil",
    slug: "profil-fitil",
    fields: [
      { key: "genislik", label: "Genişlik", unit: "mm" },
      { key: "yukseklik", label: "Yükseklik", unit: "mm" },
      { key: "uzunluk", label: "Uzunluk", unit: "m" },
      { key: "profilTipi", label: "Profil Tipi", type: "TEXT" },
    ],
  },
  {
    name: "Yağ Keçesi",
    slug: "yag-kecesi",
    fields: [
      { key: "icCap", label: "İç Çap", unit: "mm" },
      { key: "disCap", label: "Dış Çap", unit: "mm" },
      { key: "genislik", label: "Genişlik", unit: "mm" },
      { key: "tip", label: "Tip", type: "TEXT" },
    ],
  },
  {
    name: "Kalıp",
    slug: "kalip",
    fields: [
      { key: "kalipNo", label: "Kalıp No", type: "TEXT" },
      { key: "gozSayisi", label: "Göz Sayısı" },
      { key: "olculer", label: "Kalıp Ölçüleri", type: "TEXT" },
      { key: "presTonaji", label: "Pres Tonajı", unit: "ton" },
    ],
  },
  {
    name: "Hammadde",
    slug: "hammadde",
    fields: [
      { key: "tip", label: "Hammadde Tipi", type: "TEXT" },
      { key: "partiNo", label: "Parti No", type: "TEXT" },
      { key: "yogunluk", label: "Yoğunluk", unit: "g/cm³" },
    ],
  },
  {
    name: "Diğer",
    slug: "diger",
    fields: [],
  },
];

const MATERIALS = [
  { name: "Silikon (VMQ)", code: "VMQ", foodGrade: true },
  { name: "NBR (Nitril)", code: "NBR", foodGrade: false },
  { name: "EPDM", code: "EPDM", foodGrade: false },
  { name: "FKM / Viton", code: "FKM", foodGrade: false },
  { name: "PTFE (Teflon)", code: "PTFE", foodGrade: true },
  { name: "Poliüretan (PU)", code: "PU", foodGrade: false },
  { name: "Neopren (CR)", code: "CR", foodGrade: false },
  { name: "Platin Kürlü Silikon", code: "VMQ-Pt", foodGrade: true },
];

async function main() {
  console.log("→ Ürün tipleri ve alanlar oluşturuluyor...");
  for (const [index, type] of PRODUCT_TYPES.entries()) {
    const created = await prisma.productType.upsert({
      where: { slug: type.slug },
      update: { name: type.name, sortOrder: index },
      create: { name: type.name, slug: type.slug, sortOrder: index },
    });

    for (const [fieldIndex, field] of type.fields.entries()) {
      await prisma.productTypeField.upsert({
        where: { productTypeId_key: { productTypeId: created.id, key: field.key } },
        update: {
          label: field.label,
          type: field.type ?? "NUMBER",
          unit: field.unit ?? null,
          options: field.options ?? [],
          sortOrder: fieldIndex,
        },
        create: {
          productTypeId: created.id,
          key: field.key,
          label: field.label,
          type: field.type ?? "NUMBER",
          unit: field.unit ?? null,
          options: field.options ?? [],
          sortOrder: fieldIndex,
        },
      });
    }
  }

  console.log("→ Malzemeler oluşturuluyor...");
  for (const material of MATERIALS) {
    await prisma.material.upsert({
      where: { name: material.name },
      update: { code: material.code, foodGrade: material.foodGrade },
      create: material,
    });
  }

  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME ?? "Yönetici";

  if (email && password) {
    console.log(`→ İlk kullanıcı oluşturuluyor: ${email}`);
    await prisma.user.upsert({
      where: { email: email.toLowerCase() },
      update: {},
      create: {
        email: email.toLowerCase(),
        name,
        passwordHash: await bcrypt.hash(password, 10),
      },
    });
  } else {
    console.log("! SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD tanımlı değil, kullanıcı oluşturulmadı.");
  }

  console.log("✔ Hazır.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
