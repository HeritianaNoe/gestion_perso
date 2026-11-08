// Règles de calcul des congés payés (logique pure, sans accès base de données).

/** Valeur par défaut du droit à congé (modifiable dans Paramètres) : 2,5 jours par mois de service. */
export const JOURS_PAR_MOIS_DEFAUT = 2.5;

type CongeLite = {
  typeConge: string;
  statut: string;
  dateDebut: Date | string;
  dateFin: Date | string;
};

const toUTC = (v: Date | string) => {
  const d = new Date(v);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
};

/** Nombre de mois complets écoulés entre l'embauche et la date de référence. */
export function moisDeService(embauche: Date | string, ref: Date = new Date()): number {
  const a = new Date(embauche);
  const months =
    (ref.getUTCFullYear() - a.getUTCFullYear()) * 12 +
    (ref.getUTCMonth() - a.getUTCMonth()) -
    (ref.getUTCDate() < a.getUTCDate() ? 1 : 0);
  return Math.max(0, months);
}

/** Durée d'un congé en jours calendaires, bornes incluses. */
export function joursConge(debut: Date | string, fin: Date | string): number {
  return Math.max(0, Math.round((toUTC(fin) - toUTC(debut)) / 86_400_000) + 1);
}

export function soldeConge(
  embauche: Date | string,
  conges: CongeLite[],
  joursParMois: number = JOURS_PAR_MOIS_DEFAUT,
  ref: Date = new Date(),
) {
  const mois = moisDeService(embauche, ref);
  const acquis = mois * joursParMois;
  // Seuls les congés payés comptent dans le solde (maladie, maternité, sans solde : non déduits)
  const payes = conges.filter((c) => c.typeConge === "CONGE_PAYE");
  const sum = (statut: string) =>
    payes.filter((c) => c.statut === statut).reduce((t, c) => t + joursConge(c.dateDebut, c.dateFin), 0);
  const pris = sum("APPROUVE");
  const enAttente = sum("EN_ATTENTE");
  return { mois, acquis, pris, enAttente, solde: acquis - pris };
}
