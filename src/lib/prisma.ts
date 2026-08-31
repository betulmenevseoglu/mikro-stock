import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function getClient(): PrismaClient {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL tanımlı değil. .env.local dosyasını kontrol edin.");
  }

  const client = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  globalForPrisma.prisma = client;
  return client;
}

/**
 * Bağlantı ilk kullanımda kurulur — böylece build sırasında env okunmaya çalışılmaz.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getClient();
    const value = Reflect.get(client, prop, client);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
