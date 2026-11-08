"use server";

import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { can } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

export type PasswordState =
  | { ok: true; message: string }
  | { ok: false; message: string }
  | undefined;

/**
 * Crée ou met à jour le compte User lié à l'email de l'employé,
 * avec le rôle EMPLOYE, pour qu'il puisse se connecter et consulter.
 */
export async function setEmployePassword(
  employeId: number,
  _prev: PasswordState,
  formData: FormData,
): Promise<PasswordState> {
  const session = await auth();
  if (!session?.user || !can(session.user.role, "data:write")) {
    return { ok: false, message: "Accès non autorisé." };
  }

  const password = String(formData.get("password") ?? "").trim();
  const confirm = String(formData.get("confirm") ?? "").trim();

  if (password.length < 8) {
    return { ok: false, message: "Le mot de passe doit contenir au moins 8 caractères." };
  }
  if (password !== confirm) {
    return { ok: false, message: "Les deux mots de passe ne correspondent pas." };
  }

  const employe = await prisma.employe.findUnique({ where: { id: employeId } });
  if (!employe) return { ok: false, message: "Employé introuvable." };
  if (!employe.email) return { ok: false, message: "Cet employé n'a pas d'adresse email." };

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email: employe.email },
    create: {
      email: employe.email,
      passwordHash,
      role: "EMPLOYE",
      active: true,
    },
    update: {
      passwordHash,
      active: true,
      // Ne pas écraser un rôle plus élevé (ADMIN, RH, MANAGER) s'il existe déjà
      // — on ne touche au rôle que si le compte n'existait pas (create)
    },
  });

  return {
    ok: true,
    message: `Mot de passe défini pour ${employe.email}. L'employé peut se connecter.`,
  };
}
