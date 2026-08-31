import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";

// Next.js .env.local dosyasını otomatik okur; Prisma CLI okumaz, burada yüklüyoruz.
config({ path: ".env.local" });
config();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Migration'lar doğrudan bağlantıyı kullanmalı (pooler üzerinden çalışmaz)
    url: env("DIRECT_URL"),
  },
});
