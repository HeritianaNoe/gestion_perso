// Prime d'ancienneté : logique pure (taux fourni par l'appelant, voir lib/parametres.ts).
import { moisDeService } from "@/lib/conges";

/** Années complètes d'ancienneté à la date de référence. */
export function anneesAnciennete(embauche: Date | string, ref: Date = new Date()): number {
  return Math.floor(moisDeService(embauche, ref) / 12);
}

/**
 * Prime mensuelle = salaire de base × taux % × années complètes.
 * (Cumul linéaire : 2 % par an → 10 % après 5 ans.)
 */
export function primeAnciennete(salaireBase: number, annees: number, tauxParAn: number) {
  const pourcentage = annees * tauxParAn;
  const montant = Math.round((salaireBase * pourcentage) / 100);
  return { pourcentage, montant, total: salaireBase + montant };
}
