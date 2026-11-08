import Link from "next/link";
import { auth } from "@/auth";
import { can } from "@/lib/rbac";
import { getJoursCongeParMois, getTauxAnciennete } from "@/lib/parametres";
import { saveJoursConge, saveTauxAnciennete } from "@/app/actions/parametres";
import { PageHeader } from "@/components/ui/PageHeader";
import { ParametreForm } from "@/components/crud/ParametreForm";
import { fmtNumber } from "@/components/crud/format";

const card = "max-w-2xl rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-200/40";

export default async function ParametresPage() {
  const session = await auth();
  const role = session?.user.role;
  if (!can(role, "data:read")) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
        Vous n&apos;avez pas l&apos;autorisation de consulter cette page.
      </div>
    );
  }

  const canWrite = can(role, "data:write");
  const [taux, joursParMois] = await Promise.all([getTauxAnciennete(), getJoursCongeParMois()]);

  // Exemples concrets pour que l'effet des réglages soit lisible
  const exemple = { annees: 5, salaire: 1_000_000 };
  const prime = Math.round((exemple.salaire * exemple.annees * taux) / 100);

  return (
    <>
      <PageHeader icon="settings" title="Paramètres" description="Réglages utilisés dans les calculs de l'application." />

      <div className="space-y-6">
        <section className={card}>
          <h2 className="text-base font-semibold text-slate-900">Prime d&apos;ancienneté</h2>
          <p className="mt-1 mb-5 text-sm text-slate-500">
            Pour chaque année complète passée dans l&apos;entreprise, ce pourcentage du salaire de base (contrat actif) est
            ajouté chaque mois. Le calcul par employé est visible dans{" "}
            <Link href="/prime-anciennete" className="font-medium text-indigo-600 hover:underline">
              Prime d&apos;ancienneté
            </Link>
            .
          </p>

          <ParametreForm
            action={saveTauxAnciennete}
            label="Taux par année d'ancienneté (%)"
            icon="gift"
            value={taux}
            max={100}
            canWrite={canWrite}
          />

          <p className="mt-5 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Exemple : {exemple.annees} ans d&apos;ancienneté et {fmtNumber(exemple.salaire)} Ar de salaire de base →{" "}
            <span className="font-semibold text-slate-800">
              {fmtNumber(prime)} Ar de prime par mois ({fmtNumber(exemple.annees * taux)} %)
            </span>
            .
          </p>
        </section>

        <section className={card}>
          <h2 className="text-base font-semibold text-slate-900">Congés</h2>
          <p className="mt-1 mb-5 text-sm text-slate-500">
            Nombre de jours de congé acquis pour chaque mois de service. Les soldes sont visibles dans{" "}
            <Link href="/soldes-conges" className="font-medium text-indigo-600 hover:underline">
              Soldes de congés
            </Link>
            .
          </p>

          <ParametreForm
            action={saveJoursConge}
            label="Jours de congé par mois de service"
            icon="palm"
            value={joursParMois}
            max={31}
            step="0.25"
            canWrite={canWrite}
          />

          <p className="mt-5 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Exemple : 12 mois de service →{" "}
            <span className="font-semibold text-slate-800">{fmtNumber(12 * joursParMois)} jours acquis</span>.
          </p>
          <p className="mt-2 text-xs text-slate-400">
            Un changement s&apos;applique à tous les employés, y compris pour les mois déjà travaillés : les soldes sont
            recalculés à chaque affichage.
          </p>
        </section>
      </div>
    </>
  );
}
