import { AlertTriangle, CheckCircle2, ShieldCheck } from "lucide-react";
import { fmtDate } from "./format";

const TYPES: Record<string, string> = {
  AVERTISSEMENT_ORAL: "Avertissement oral",
  AVERTISSEMENT_ECRIT: "Avertissement écrit",
  BLAME: "Blâme",
  MISE_A_PIED: "Mise à pied",
  RETENUE_SALAIRE: "Retenue sur salaire",
};

type Sanction = { id: number; type: string; date: string; motif: string; statut: string };

/** Marquage dans le détail d'un employé : liste en alerte s'il y a des sanctions, « Neat » sinon. */
export function SanctionsSummary({ sanctions }: { sanctions: Sanction[] }) {
  if (sanctions.length === 0) {
    return (
      <div className="mt-6 flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm">
        <ShieldCheck size={16} className="text-slate-400" aria-hidden="true" />
        <span className="font-medium text-slate-600">Sanctions &amp; Avertissements</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
          <CheckCircle2 size={12} aria-hidden="true" />
          Neat
        </span>
      </div>
    );
  }

  const actives = sanctions.filter((s) => s.statut === "ACTIF").length;

  return (
    <div className="mt-6 rounded-xl border border-red-200 bg-red-50/60 p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
        <AlertTriangle size={16} className="text-red-500" aria-hidden="true" />
        <span className="font-semibold text-red-800">Sanctions &amp; Avertissements</span>
        <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
          {sanctions.length} au total · {actives} active{actives > 1 ? "s" : ""}
        </span>
      </div>
      <ul className="divide-y divide-red-100">
        {sanctions.map((s) => (
          <li key={s.id} className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1 py-2 text-sm">
            <div className="min-w-0">
              <p className="font-medium text-slate-800">{TYPES[s.type] ?? s.type}</p>
              <p className="text-slate-600">{s.motif}</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="tabular-nums">{fmtDate(s.date)}</span>
              <span
                className={
                  s.statut === "ACTIF"
                    ? "rounded-full bg-red-100 px-2 py-0.5 font-medium text-red-700"
                    : "rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-600"
                }
              >
                {s.statut === "ACTIF" ? "Active" : "Levée"}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
