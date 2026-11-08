import Link from "next/link";
import { auth } from "@/auth";
import { can } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { getTauxAnciennete } from "@/lib/parametres";
import { anneesAnciennete, primeAnciennete } from "@/lib/anciennete";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { Pagination } from "@/components/ui/Pagination";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { PrimeExportButtons } from "@/components/crud/PrimeExportButtons";
import { AppIcon } from "@/components/ui/AppIcon";
import { fmtDate, fmtNumber } from "@/components/crud/format";
import { cn } from "@/lib/cn";

const PAGE_SIZE = 10;
const STATUT_LABELS: Record<string, string> = { ACTIF: "Actif", EN_CONGE: "En congé" };
const ar = (n: number) => `${fmtNumber(n)} Ar`;

export default async function PrimeAnciennetePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const session = await auth();
  if (!can(session?.user.role, "data:read")) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
        Vous n&apos;avez pas l&apos;autorisation de consulter cette page.
      </div>
    );
  }

  const { q, page } = await searchParams;
  const current = Math.max(1, Number(page) || 1);
  const term = q?.trim();
  const search = term
    ? {
        OR: [
          { nom: { contains: term, mode: "insensitive" as const } },
          { prenom: { contains: term, mode: "insensitive" as const } },
          { matricule: { contains: term, mode: "insensitive" as const } },
        ],
      }
    : {};

  const today = new Date();
  const [taux, employes] = await Promise.all([
    getTauxAnciennete(),
    prisma.employe.findMany({
      // Seuls les employés encore en poste perçoivent la prime
      where: { AND: [search, { statut: { in: ["ACTIF", "EN_CONGE"] } }] },
      orderBy: [{ nom: "asc" }, { prenom: "asc" }],
      include: { contrats: { orderBy: { dateDebut: "desc" }, select: { dateDebut: true, dateFin: true, salaireActuel: true } } },
    }),
  ]);

  const all = employes.map((e) => {
    const contrat = e.contrats.find((c) => c.dateDebut <= today && (!c.dateFin || c.dateFin >= today));
    const base = contrat ? Number(contrat.salaireActuel) : null;
    const annees = anneesAnciennete(e.dateEmbauche, today);
    return { e, base, annees, prime: base !== null ? primeAnciennete(base, annees, taux) : null };
  });

  const exportRows = all.map(({ e, base, annees, prime }) => ({
    nom: `${e.prenom} ${e.nom}`,
    matricule: e.matricule,
    statut: e.statut,
    dateEmbauche: e.dateEmbauche.toISOString(),
    annees,
    base,
    pourcentage: prime?.pourcentage ?? null,
    prime: prime?.montant ?? null,
    total: prime?.total ?? null,
  }));
  const rows = all.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const totalPrimes = all.reduce((t, r) => t + (r.prime?.montant ?? 0), 0);
  const beneficiaires = all.filter((r) => (r.prime?.montant ?? 0) > 0).length;
  const th = "px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500";

  const kpis = [
    { label: "Taux par année", value: `${fmtNumber(taux)} %`, sub: "Modifiable dans Paramètres" },
    { label: "Bénéficiaires", value: String(beneficiaires), sub: `sur ${all.length} employés en poste` },
    { label: "Primes par mois", value: ar(totalPrimes), sub: "Total à ajouter aux salaires" },
  ];

  return (
    <>
      <PageHeader
        icon="gift"
        title="Prime d'ancienneté"
        description={`${fmtNumber(taux)} % du salaire de base par année complète d'ancienneté.`}
        actions={<SearchInput placeholder="Rechercher un employé..." />}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/40">
            <p className="text-xs font-medium text-slate-400">{k.label}</p>
            <p className="mt-1.5 text-xl font-semibold tracking-tight text-slate-900">{k.value}</p>
            <p className="mt-1 text-xs text-slate-500">
              {k.label === "Taux par année" ? (
                <Link href="/parametres" className="text-indigo-600 hover:underline">{k.sub}</Link>
              ) : (
                k.sub
              )}
            </p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/50">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80">
                <th className={th}>Employé</th>
                <th className={th}>Embauche</th>
                <th className={cn(th, "text-right")}>Ancienneté</th>
                <th className={cn(th, "text-right")}>Salaire de base</th>
                <th className={cn(th, "text-right")}>Majoration</th>
                <th className={cn(th, "text-right")}>Prime / mois</th>
                <th className={cn(th, "text-right")}>Salaire avec prime</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <div className="mx-auto flex max-w-xs flex-col items-center gap-2">
                      <div className="grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-400">
                        <AppIcon name="gift" size={22} />
                      </div>
                      <p className="text-sm font-medium text-slate-600">Aucun employé trouvé</p>
                    </div>
                  </td>
                </tr>
              )}
              {rows.map(({ e, base, annees, prime }) => (
                <tr key={e.id} className="transition-colors hover:bg-indigo-50/30">
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-2.5">
                      <Avatar photo={e.photo} sexe={e.sexe} id={e.id} alt={`${e.prenom} ${e.nom}`} size={32} />
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-slate-800">{e.prenom} {e.nom}</span>
                        <span className="mt-0.5 flex items-center gap-2 text-xs text-slate-400">
                          {e.matricule}
                          <Badge value={e.statut} label={STATUT_LABELS[e.statut]} />
                        </span>
                      </span>
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-slate-700">{fmtDate(e.dateEmbauche.toISOString())}</td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-right tabular-nums text-slate-700">
                    {annees} an{annees > 1 ? "s" : ""}
                  </td>
                  {prime && base !== null ? (
                    <>
                      <td className="whitespace-nowrap px-5 py-3.5 text-right tabular-nums text-slate-700">{ar(base)}</td>
                      <td className="px-5 py-3.5 text-right tabular-nums text-slate-500">+{fmtNumber(prime.pourcentage)} %</td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-right font-semibold tabular-nums text-emerald-700">
                        {ar(prime.montant)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-right font-semibold tabular-nums text-slate-900">
                        {ar(prime.total)}
                      </td>
                    </>
                  ) : (
                    <td colSpan={4} className="px-5 py-3.5 text-right text-xs text-slate-400">
                      Aucun contrat actif
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination page={current} pages={Math.max(1, Math.ceil(all.length / PAGE_SIZE))} basePath="/prime-anciennete" q={q} actions={<PrimeExportButtons rows={exportRows} taux={taux} q={q} />} />
    </>
  );
}
