"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { setSessionCookie, clearSessionCookie } from "@/lib/session";

export type GirisDurumu = { hata?: string };

export async function girisYap(
  _prev: GirisDurumu,
  formData: FormData,
): Promise<GirisDurumu> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const sifre = String(formData.get("sifre") ?? "");
  const devam = String(formData.get("devam") ?? "/");

  if (!email || !sifre) {
    return { hata: "E-posta ve şifre gerekli." };
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // Kullanıcı yok veya şifre yanlış — hangisi olduğunu belli etmiyoruz
  if (!user || !user.isActive || !(await bcrypt.compare(sifre, user.passwordHash))) {
    return { hata: "E-posta veya şifre hatalı." };
  }

  await setSessionCookie({ id: user.id, email: user.email, name: user.name });

  redirect(devam.startsWith("/") ? devam : "/");
}

export async function cikisYap() {
  await clearSessionCookie();
  redirect("/giris");
}
