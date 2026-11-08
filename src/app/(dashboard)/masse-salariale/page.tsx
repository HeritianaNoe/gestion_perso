import Link from "next/link";
import { auth } from "@/auth";
import { can } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { AppIcon } from "@/components/ui/AppIcon";
import { fmtNumber } from "@/components/crud/format";
import { cn } from "@/lib/cn";

const MOIS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

const ar = (n: number) => `${fmtNumber(n)} Ar`;

export default async function MasseSalarialePage({
  searchParams,
}: {
  searchParams: Promise<{ annee?: string }>;
}) {
  const session = await auth();
  if (!can(session?.user.role, "data:read")) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
        Vous n&apos;avez pas l&apos;autorisation de consulter cette page.
      </div>
    );
  }

  const { annee } = await searchParams;
  const annees = await prisma.annee.findMany({ orderBy: { annee: "desc" } });
  const selected = annees.find((a) => String(a.annee) === annee) ?? annees[0];

  if (!selected) {
    return (
      <>
        <PageHeader icon="chart" title="Masse salariale" />
        <div className="rounded-2xl border border-slate-200/80 bg-white px-5 py-16 text-center text-sm text-slate-500 shadow-sm">
          Aucune année enregistrée. Créez une année puis ajoutez des paies pour suivre la masse salariale.
        </div>
      </>
    );
  }

  const grouped = await prisma.paie.groupBy({
    by: ["mois"],
    where: { anneeId: selected.id },
    _sum: { salaireNet: true, primes: true, deductions: true },
    _count: { _all: true },
  });

  // 12 mois, y compris ceux sans paie
  const months = MOIS.map((label, i) => {
    const g = grouped.find((x) => x.mois === i + 1);
    return {
      label,
      bulletins: g?._count._all ?? 0,
      masse: Number(g?._sum.salaireNet ?? 0),
      primes: Number(g?._sum.primes ?? 0),
      deductions: Number(g?._sum.deductions ?? 0),
    };
  });

  const paidMonths = months.filter((m) => m.bulletins > 0);
  const totalMasse = months.reduce((t, m) => t + m.masse, 0);
  const totalPrimes = months.reduce((t, m) => t + m.primes, 0);
  const totalDeductions = months.reduce((t, m) => t + m.deductions, 0);
  const totalBulletins = months.reduce((t, m) => t + m.bulletins, 0);
  const moyenne = paidMonths.length ? totalMasse / paidMonths.length : 0;
  const max = Math.max(...months.map((m) => m.masse), 1);
  const peak = paidMonths.length ? paidMonths.reduce((a, b) => (b.masse > a.masse ? b : a)) : null;

  const kpis = [
    { label: "Masse salariale annuelle", value: ar(totalMasse), sub: `${totalBulletins} bulletins` },
    { label: "Moyenne mensuelle", value: ar(moyenne), sub: `sur ${paidMonths.length} mois payés` },
    { label: "Mois le plus élevé", value: peak ? peak.label : "—", sub: peak ? ar(peak.masse) : "Aucune paie" },
    { label: "Primes versées", value: ar(totalPrimes), sub: `Déductions : ${ar(totalDeductions)}` },
  ];

  const th = "px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500";

  return (
    <>
      <PageHeader
        icon="chart"
        title={`Masse salariale ${selected.annee}`}
        description="Somme des salaires nets payés, mois par mois."
        actions={
          <nav className="flex flex-wrap gap-1.5" aria-label="Année">
            {annees.map((a) => (
              <Link
                key={a.id}
                href={`/masse-salariale?annee=${a.annee}`}
                aria-current={a.id === selected.id ? "page" : undefined}
                className={cn(
                  "rounded-xl border px-3.5 py-1.5 text-sm font-medium shadow-sm transition",
                  a.id === selected.id
                    ? "border-indigo-600 bg-indigo-600 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:bg-indigo-50",
                )}
              >
                {a.annee}
              </Link>
            ))}
          </nav>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/40">
            <p className="text-xs font-medium text-slate-400">{k.label}</p>
            <p className="mt-1.5 text-xl font-semibold tracking-tight text-slate-900">{k.value}</p>
            <p className="mt-1 text-xs text-slate-500">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Histogramme mensuel */}
      <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/40">
        <h3 className="mb-4 text-sm font-semibold text-slate-800">Évolution mensuelle</h3>
        <div className="flex h-48 items-end gap-2" role="img" aria-label="Masse salariale par mois">
          {months.map((m) => (
            <div key={m.label} className="flex h-full min-w-0 flex-1 flex-col justify-end" title={`${m.label} : ${ar(m.masse)}`}>
              <div
                className={cn("w-full rounded-t-md", m.masse > 0 ? "bg-indigo-500" : "bg-slate-100")}
                style={{ height: `${Math.max((m.masse / max) * 100, m.masse > 0 ? 3 : 1.5)}%` }}
              />
            </div>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          {months.map((m) => (
            <span key={m.label} className="min-w-0 flex-1 truncate text-center text-[11px] text-slate-400">
              {m.label.slice(0, 3)}
            </span>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/50">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80">
                <th className={th}>Mois</th>
                <th className={cn(th, "text-right")}>Bulletins</th>
                <th className={cn(th, "text-right")}>Primes</th>
                <th className={cn(th, "text-right")}>Déductions</th>
                <th className={cn(th, "text-right")}>Masse salariale</th>
                <th className={cn(th, "text-right")}>Variation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {months.map((m, i) => {
                const prev = i > 0 ? months[i - 1] : null;
                const variation = prev && prev.masse > 0 && m.masse > 0 ? ((m.masse - prev.masse) / prev.masse) * 100 : null;
                return (
                  <tr key={m.label} className={cn("transition-colors hover:bg-indigo-50/30", m.bulletins === 0 && "text-slate-400")}>
                    <td className="px-5 py-3 font-medium text-slate-700">{m.label}</td>
                    <td className="px-5 py-3 text-right tabular-nums">{m.bulletins || "—"}</td>
                    <td className="px-5 py-3 text-right tabular-nums">{m.bulletins ? ar(m.primes) : "—"}</td>
                    <td className="px-5 py-3 text-right tabular-nums">{m.bulletins ? ar(m.deductions) : "—"}</td>
                    <td className="px-5 py-3 text-right font-semibold tabular-nums text-slate-900">
                      {m.bulletins ? ar(m.masse) : "—"}
                    </td>
                    <td
                      className={cn(
                        "px-5 py-3 text-right tabular-nums",
                        variation === null ? "text-slate-400" : variation >= 0 ? "text-emerald-700" : "text-red-600",
                      )}
                    >
                      {variation === null ? "—" : `${variation >= 0 ? "+" : ""}${fmtNumber(variation)} %`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-slate-200 bg-slate-50/80 font-semibold text-slate-900">
                <td className="px-5 py-3.5">Total {selected.annee}</td>
                <td className="px-5 py-3.5 text-right tabular-nums">{totalBulletins}</td>
                <td className="px-5 py-3.5 text-right tabular-nums">{ar(totalPrimes)}</td>
                <td className="px-5 py-3.5 text-right tabular-nums">{ar(totalDeductions)}</td>
                <td className="px-5 py-3.5 text-right tabular-nums">{ar(totalMasse)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </>
  );
}
