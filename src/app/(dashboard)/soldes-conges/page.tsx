import { auth } from "@/auth";
import { can } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { soldeConge } from "@/lib/conges";
import { getJoursCongeParMois } from "@/lib/parametres";
import type { SoldeRow } from "@/lib/pdf";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { Pagination } from "@/components/ui/Pagination";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { AppIcon } from "@/components/ui/AppIcon";
import { fmtDate, fmtNumber } from "@/components/crud/format";
import { SoldesExportButtons } from "@/components/crud/SoldesPdfButton";
import { cn } from "@/lib/cn";

const PAGE_SIZE = 10;
const STATUT_LABELS: Record<string, string> = {
  ACTIF: "Actif", EN_CONGE: "En congé", LICENCIE: "Licencié", DEMISSIONNAIRE: "Démissionnaire",
};

const jours = (n: number) => `${fmtNumber(n)} j`;

export default async function SoldesCongesPage({
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
  const where = term
    ? {
        OR: [
          { nom: { contains: term, mode: "insensitive" as const } },
          { prenom: { contains: term, mode: "insensitive" as const } },
          { matricule: { contains: term, mode: "insensitive" as const } },
        ],
      }
    : {};

  // Tous les employés du filtre : sert au PDF (complet) ; la page n'affiche qu'une tranche
  const [joursParMois, employes] = await Promise.all([
    getJoursCongeParMois(),
    prisma.employe.findMany({
      where,
      orderBy: [{ nom: "asc" }, { prenom: "asc" }],
      include: { conges: { select: { typeConge: true, statut: true, dateDebut: true, dateFin: true } } },
    }),
  ]);
  const total = employes.length;

  const all = employes.map((e) => ({ e, s: soldeConge(e.dateEmbauche, e.conges, joursParMois) }));
  const rows = all.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const pdfRows: SoldeRow[] = all.map(({ e, s }) => ({
    nom: `${e.prenom} ${e.nom}`,
    matricule: e.matricule,
    statut: e.statut,
    dateEmbauche: e.dateEmbauche.toISOString(),
    ...s,
  }));
  const th = "px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500";

  return (
    <>
      <PageHeader
        icon="balance"
        title={`Soldes de congés (${total})`}
        description={`${fmtNumber(joursParMois)} jours acquis par mois de service (modifiable dans Paramètres). Seuls les congés payés approuvés sont déduits du solde.`}
        actions={<SearchInput placeholder="Rechercher un employé..." />}
      />

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/50">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80">
                <th className={th}>Employé</th>
                <th className={th}>Embauche</th>
                <th className={cn(th, "text-right")}>Mois de service</th>
                <th className={cn(th, "text-right")}>Acquis</th>
                <th className={cn(th, "text-right")}>Pris</th>
                <th className={cn(th, "text-right")}>En attente</th>
                <th className={cn(th, "text-right")}>Solde</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <div className="mx-auto flex max-w-xs flex-col items-center gap-2">
                      <div className="grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-400">
                        <AppIcon name="balance" size={22} />
                      </div>
                      <p className="text-sm font-medium text-slate-600">Aucun employé trouvé</p>
                    </div>
                  </td>
                </tr>
              )}
              {rows.map(({ e, s }) => {
                const ratio = s.acquis > 0 ? Math.min(100, (s.pris / s.acquis) * 100) : 0;
                return (
                  <tr key={e.id} className="transition-colors hover:bg-indigo-50/30">
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-2.5">
                        <Avatar photo={e.photo} sexe={e.sexe} id={e.id} alt={`${e.prenom} ${e.nom}`} size={32} />
                        <span className="min-w-0">
                          <span className="block truncate font-medium text-slate-800">
                            {e.prenom} {e.nom}
                          </span>
                          <span className="mt-0.5 flex items-center gap-2 text-xs text-slate-400">
                            {e.matricule}
                            <Badge value={e.statut} label={STATUT_LABELS[e.statut]} />
                          </span>
                        </span>
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-slate-700">
                      {fmtDate(e.dateEmbauche.toISOString())}
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums text-slate-700">{s.mois}</td>
                    <td className="px-5 py-3.5 text-right tabular-nums text-slate-700">{jours(s.acquis)}</td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="tabular-nums text-slate-700">{jours(s.pris)}</span>
                      <div
                        className="ml-auto mt-1.5 h-1.5 w-20 overflow-hidden rounded-full bg-slate-100"
                        role="img"
                        aria-label={`${Math.round(ratio)} % des congés acquis ont été pris`}
                      >
                        <div className="h-full rounded-full bg-indigo-500" style={{ width: `${ratio}%` }} />
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums text-slate-500">
                      {s.enAttente > 0 ? jours(s.enAttente) : "—"}
                    </td>
                    <td
                      className={cn(
                        "px-5 py-3.5 text-right font-semibold tabular-nums",
                        s.solde < 0 ? "text-red-600" : "text-emerald-700",
                      )}
                    >
                      {jours(s.solde)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        page={current}
        pages={Math.max(1, Math.ceil(total / PAGE_SIZE))}
        basePath="/soldes-conges"
        q={q}
        actions={<SoldesExportButtons rows={pdfRows} joursParMois={joursParMois} />}
      />
    </>
  );
}
