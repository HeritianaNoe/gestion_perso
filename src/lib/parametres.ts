import { prisma } from "@/lib/prisma";
import { JOURS_PAR_MOIS_DEFAUT } from "@/lib/conges";

/** Pourcentage du salaire de base ajouté pour chaque année complète d'ancienneté. */
export const TAUX_ANCIENNETE_KEY = "taux_prime_anciennete";
export const TAUX_ANCIENNETE_DEFAUT = 2;

export async function getTauxAnciennete(): Promise<number> {
  const p = await prisma.parametre.findUnique({ where: { cle: TAUX_ANCIENNETE_KEY } });
  const n = p ? Number(p.valeur) : NaN;
  return Number.isFinite(n) && n >= 0 ? n : TAUX_ANCIENNETE_DEFAUT;
}

/** Jours de congé acquis par mois de service. */
export const JOURS_CONGE_KEY = "jours_conge_par_mois";

export async function getJoursCongeParMois(): Promise<number> {
  const p = await prisma.parametre.findUnique({ where: { cle: JOURS_CONGE_KEY } });
  const n = p ? Number(p.valeur) : NaN;
  return Number.isFinite(n) && n >= 0 ? n : JOURS_PAR_MOIS_DEFAUT;
}
