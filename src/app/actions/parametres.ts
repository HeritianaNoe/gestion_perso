"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { can } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { JOURS_CONGE_KEY, TAUX_ANCIENNETE_KEY } from "@/lib/parametres";

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
