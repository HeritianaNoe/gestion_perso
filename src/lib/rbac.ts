import type { Role } from "@prisma/client";

export type Permission = "data:read" | "data:write" | "data:delete";

const MATRIX: Record<Role, Permission[]> = {
  ADMIN: ["data:read", "data:write", "data:delete"],
  DIRECTOR: ["data:read", "data:write", "data:delete"],
  RH: ["data:read", "data:write"],
  MANAGER: ["data:read"],
  // Employé : consultation uniquement (tableau de bord, listes…)
  EMPLOYE: ["data:read"],
};

export const can = (role: Role | undefined, perm: Permission) =>
  !!role && MATRIX[role]?.includes(perm);

export const canDeleteResource = (role: Role | undefined, _key: string) => can(role, "data:delete");

/** Qui peut modifier la matrice d'accès du personnel. */
export function canManageAccess(role: Role | undefined): boolean {
  return role === "ADMIN" || role === "DIRECTOR";
}

export const STAFF_ROLES: Role[] = ["ADMIN", "DIRECTOR", "RH", "MANAGER", "EMPLOYE"];

export const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Administrateur",
  DIRECTOR: "Directeur",
  RH: "RH",
  MANAGER: "Manager",
  EMPLOYE: "Employé",
};

/** Modules du menu (pour la matrice d'accès). */
export const ACCESS_RESOURCES = [
  { key: "dashboard", label: "Tableau de bord", href: "/dashboard" },
  { key: "departements", label: "Départements", href: "/departements" },
  { key: "postes", label: "Postes", href: "/postes" },
  { key: "employes", label: "Employés", href: "/employes" },
  { key: "contrats", label: "Contrats", href: "/contrats" },
  { key: "paies", label: "Paies", href: "/paies" },
  { key: "annees", label: "Années", href: "/annees" },
  { key: "prime-anciennete", label: "Prime d'ancienneté", href: "/prime-anciennete" },
  { key: "masse-salariale", label: "Masse salariale", href: "/masse-salariale" },
  { key: "conges", label: "Congés", href: "/conges" },
  { key: "soldes-conges", label: "Soldes de congés", href: "/soldes-conges" },
  { key: "sanctions", label: "Sanctions", href: "/sanctions" },
  { key: "parametres", label: "Paramètres", href: "/parametres" },
  { key: "access", label: "Gestion des accès", href: "/parametres#access" },
] as const;

export type ResourceAccessKey = (typeof ACCESS_RESOURCES)[number]["key"];

/** Défauts : tout le monde avec data:read voit les modules ; access réservé admin/directeur. */
export const DEFAULT_MODULE_ACCESS: Record<Role, Partial<Record<ResourceAccessKey, boolean>>> = {
  ADMIN: Object.fromEntries(ACCESS_RESOURCES.map((r) => [r.key, true])) as Record<ResourceAccessKey, boolean>,
  DIRECTOR: Object.fromEntries(ACCESS_RESOURCES.map((r) => [r.key, true])) as Record<ResourceAccessKey, boolean>,
  RH: {
    dashboard: true,
    departements: true,
    postes: true,
    employes: true,
    contrats: true,
    paies: true,
    annees: true,
    "prime-anciennete": true,
    "masse-salariale": true,
    conges: true,
    "soldes-conges": true,
    sanctions: true,
    parametres: true,
    access: false,
  },
  MANAGER: {
    dashboard: true,
    departements: true,
    postes: true,
    employes: true,
    contrats: true,
    paies: true,
    annees: true,
    "prime-anciennete": true,
    "masse-salariale": true,
    conges: true,
    "soldes-conges": true,
    sanctions: true,
    parametres: true,
    access: false,
  },
  EMPLOYE: {
    dashboard: true,
    departements: true,
    postes: true,
    employes: true,
    contrats: true,
    paies: true,
    annees: true,
    "prime-anciennete": true,
    "masse-salariale": true,
    conges: true,
    "soldes-conges": true,
    sanctions: true,
    parametres: true,
    access: false,
  },
};

export function canAccessModule(
  role: Role | undefined,
  resource: ResourceAccessKey,
  overrides?: Record<string, boolean>,
): boolean {
  if (!role) return false;
  const key = `${role}:${resource}`;
  if (overrides && Object.prototype.hasOwnProperty.call(overrides, key)) {
    return overrides[key];
  }
  return DEFAULT_MODULE_ACCESS[role]?.[resource] ?? false;
}

export function resourceForHref(href: string): ResourceAccessKey | null {
  const sorted = [...ACCESS_RESOURCES].sort((a, b) => b.href.length - a.href.length);
  for (const r of sorted) {
    if (r.key === "access") continue;
    if (href === r.href || href.startsWith(r.href + "/")) return r.key;
  }
  return null;
}
