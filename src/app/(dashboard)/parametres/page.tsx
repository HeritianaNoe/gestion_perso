import Link from "next/link";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { can, canManageAccess } from "@/lib/rbac";
import { getJoursCongeParMois, getTauxAnciennete, getRoleAccessMap, resolveAccessMatrix } from "@/lib/parametres";
import { AccessMatrix } from "@/components/crud/AccessMatrix";
import { saveJoursConge, saveTauxAnciennete, setThemeAction } from "@/app/actions/parametres";
import { PageHeader } from "@/components/ui/PageHeader";
import { ParametreForm } from "@/components/crud/ParametreForm";
import { fmtNumber } from "@/components/crud/format";
import { DEFAULT_THEME, THEMES, THEME_COOKIE, isTheme, type ThemeKey } from "@/lib/theme";

const card = "rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-200/40";

const SWATCH: Record<ThemeKey, { sidebar: string; primary: string; soft: string }> = {
  indigo: { sidebar: "#4338ca", primary: "#4f46e5", soft: "#eef2ff" },
  gray: { sidebar: "#1f2937", primary: "#374151", soft: "#e5e7eb" },
  red: { sidebar: "#7f1d1d", primary: "#b91c1c", soft: "#fee2e2" },
  green: { sidebar: "#065f46", primary: "#047857", soft: "#d1fae5" },
};

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
  const canEditAccess = canManageAccess(role);
  const [taux, joursParMois, overrides] = await Promise.all([
    getTauxAnciennete(),
    getJoursCongeParMois(),
    getRoleAccessMap(),
  ]);
  const matrix = resolveAccessMatrix(overrides);

  const saved = (await cookies()).get(THEME_COOKIE)?.value;
  const current: ThemeKey = isTheme(saved) ? saved : DEFAULT_THEME;

  const exemple = { annees: 5, salaire: 1_000_000 };
  const prime = Math.round((exemple.salaire * exemple.annees * taux) / 100);

  return (
    <>
      <PageHeader
        icon="settings"
        title="Paramètres"
        description="Apparence, calculs RH et accès du personnel."
      />

      <div className="space-y-6">
        <section className={card}>
          <h2 className="text-base font-semibold text-slate-900">Apparence</h2>
          <p className="mt-1 mb-5 text-sm text-slate-500">
            Choisissez la couleur principale. Le choix est enregistré sur cet appareil (cookie) et
            appliqué à toutes les pages.
          </p>
          <form action={setThemeAction} className="grid gap-4 sm:grid-cols-2">
            {(Object.keys(THEMES) as ThemeKey[]).map((key) => {
              const active = key === current;
              const sw = SWATCH[key];
              return (
                <button
                  key={key}
                  type="submit"
                  name="theme"
                  value={key}
                  aria-pressed={active}
                  className={`rounded-2xl border-2 p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    active
                      ? "border-indigo-600 bg-indigo-50"
                      : "border-slate-200 hover:border-indigo-300"
                  }`}
                >
                  <div className="flex h-20 overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <div className="w-1/4" style={{ background: sw.sidebar }} />
                    <div className="flex-1 space-y-2 p-2.5">
                      <div className="h-2.5 w-1/2 rounded" style={{ background: sw.soft }} />
                      <div className="h-6 w-1/3 rounded" style={{ background: sw.primary }} />
                      <div className="h-2 w-3/4 rounded bg-slate-100" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{THEMES[key].label}</p>
                      <p className="text-xs text-slate-500">{THEMES[key].description}</p>
                    </div>
                    {active && (
                      <span className="shrink-0 rounded-full bg-indigo-600 px-2.5 py-0.5 text-xs font-medium text-white">
                        Actif
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </form>
        </section>

        <section className={`${card} max-w-2xl`}>
          <h2 className="text-base font-semibold text-slate-900">Prime d&apos;ancienneté</h2>
          <p className="mt-1 mb-5 text-sm text-slate-500">
            Pour chaque année complète passée dans l&apos;entreprise, ce pourcentage du salaire de base
            (contrat actif) est ajouté chaque mois. Le calcul par employé est visible dans{" "}
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
            Exemple : {exemple.annees} ans d&apos;ancienneté et {fmtNumber(exemple.salaire)} Ar de salaire
            de base →{" "}
            <span className="font-semibold text-slate-800">
              {fmtNumber(prime)} Ar de prime par mois ({fmtNumber(exemple.annees * taux)} %)
            </span>
            .
          </p>
        </section>

        <section className={`${card} max-w-2xl`}>
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
            <span className="font-semibold text-slate-800">
              {fmtNumber(12 * joursParMois)} jours acquis
            </span>
            .
          </p>
          <p className="mt-2 text-xs text-slate-400">
            Un changement s&apos;applique à tous les employés, y compris pour les mois déjà travaillés :
            les soldes sont recalculés à chaque affichage.
          </p>
        </section>

        <AccessMatrix matrix={matrix} canEdit={canEditAccess} />
      </div>
    </>
  );
}
