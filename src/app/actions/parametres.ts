"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { THEME_COOKIE, isTheme } from "@/lib/theme";
import { can, canManageAccess, ACCESS_RESOURCES, STAFF_ROLES } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import {
  JOURS_CONGE_KEY,
  TAUX_ANCIENNETE_KEY,
  ROLE_ACCESS_KEY,
  saveRoleAccessMap,
} from "@/lib/parametres";

export type ParamState = { ok: boolean; message?: string; error?: string } | undefined;

const fr = (n: number) => String(n).replace(".", ",");

/** Enregistre un paramètre numérique (clé / valeur) après contrôle des droits et de la plage. */
async function saveNumber(
  cle: string,
  formData: FormData,
  max: number,
  successMessage: (v: number) => string,
): Promise<ParamState> {
  const session = await auth();
  if (!session?.user || !can(session.user.role, "data:write")) {
    return { ok: false, error: "Accès non autorisé." };
  }

  const raw = String(formData.get("valeur") ?? "").trim().replace(",", ".");
  const n = Number(raw);
  if (!raw || !Number.isFinite(n) || n < 0 || n > max) {
    return { ok: false, error: `Saisissez une valeur entre 0 et ${max}.` };
  }
  const valeur = Math.round(n * 100) / 100;

  await prisma.parametre.upsert({
    where: { cle },
    update: { valeur: String(valeur) },
    create: { cle, valeur: String(valeur) },
  });

  revalidatePath("/parametres");
  revalidatePath("/prime-anciennete");
  revalidatePath("/soldes-conges");
  return { ok: true, message: successMessage(valeur) };
}

export async function saveTauxAnciennete(_prev: ParamState, formData: FormData): Promise<ParamState> {
  return saveNumber(TAUX_ANCIENNETE_KEY, formData, 100, (v) => `Taux enregistré : ${fr(v)} % par année d'ancienneté.`);
}

export async function saveJoursConge(_prev: ParamState, formData: FormData): Promise<ParamState> {
  return saveNumber(JOURS_CONGE_KEY, formData, 31, (v) => `Droit à congé enregistré : ${fr(v)} jours par mois de service.`);
}

export type AccessFormState = { ok: boolean; message?: string; error?: string };

/** Matrice d'accès — Admin et Directeur uniquement. */
export async function saveAccessMatrix(
  _prev: AccessFormState | undefined,
  formData: FormData,
): Promise<AccessFormState> {
  const session = await auth();
  if (!session?.user || !canManageAccess(session.user.role)) {
    return { ok: false, error: "Seuls l'Administrateur et le Directeur peuvent modifier les accès." };
  }

  const map: Record<string, boolean> = {};
  for (const role of STAFF_ROLES) {
    for (const res of ACCESS_RESOURCES) {
      const field = `access_${role}_${res.key}`;
      let checked = formData.get(field) === "on" || formData.get(field) === "true";
      if (res.key === "access" && (role === "ADMIN" || role === "DIRECTOR")) {
        checked = true;
      }
      map[`${role}:${res.key}`] = checked;
    }
  }

  await saveRoleAccessMap(map);
  revalidatePath("/parametres");
  revalidatePath("/", "layout");
  return { ok: true, message: "Accès du personnel enregistrés." };
}


/** Enregistre le thème (cookie 1 an). Tout utilisateur connecté peut changer. */
export async function setThemeAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("UNAUTHENTICATED");

  const theme = formData.get("theme");
  if (!isTheme(theme)) return;

  const store = await cookies();
  store.set(THEME_COOKIE, theme, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    httpOnly: false,
  });

  revalidatePath("/", "layout");
}
