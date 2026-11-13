import { prisma } from "@/lib/prisma";
import { JOURS_PAR_MOIS_DEFAUT } from "@/lib/conges";
import {
  ACCESS_RESOURCES,
  DEFAULT_MODULE_ACCESS,
  STAFF_ROLES,
  type ResourceAccessKey,
} from "@/lib/rbac";
import type { Role } from "@prisma/client";

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

export const ROLE_ACCESS_KEY = "role_access";

/** Matrice d'accès stockée en JSON dans parametre. */
export async function getRoleAccessMap(): Promise<Record<string, boolean>> {
  try {
    const row = await prisma.parametre.findUnique({ where: { cle: ROLE_ACCESS_KEY } });
    if (!row?.valeur) return {};
    const parsed = JSON.parse(row.valeur) as Record<string, boolean>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export async function saveRoleAccessMap(map: Record<string, boolean>) {
  await prisma.parametre.upsert({
    where: { cle: ROLE_ACCESS_KEY },
    create: { cle: ROLE_ACCESS_KEY, valeur: JSON.stringify(map) },
    update: { valeur: JSON.stringify(map) },
  });
}

export function resolveAccessMatrix(overrides: Record<string, boolean>): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  for (const role of STAFF_ROLES) {
    for (const res of ACCESS_RESOURCES) {
      const k = `${role}:${res.key}`;
      if (Object.prototype.hasOwnProperty.call(overrides, k)) out[k] = overrides[k];
      else out[k] = DEFAULT_MODULE_ACCESS[role as Role]?.[res.key as ResourceAccessKey] ?? false;
    }
  }
  return out;
}
