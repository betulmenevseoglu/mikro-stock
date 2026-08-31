import { redirect } from "next/navigation";
import { getSessionUser, type SessionUser } from "@/lib/session";

/**
 * Korumalı sayfa/aksiyonlarda kullanılır. Oturum yoksa giriş sayfasına atar.
 * Not: kullanıcı silinmiş/pasife alınmış olabilir diye DB'den de doğrulanır.
 */
export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/giris");

  const { prisma } = await import("@/lib/prisma");
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, email: true, name: true, isActive: true },
  });

  if (!dbUser || !dbUser.isActive) redirect("/giris");

  return { id: dbUser.id, email: dbUser.email, name: dbUser.name };
}
