import { auth } from "@/auth";
import { can } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  Users, Briefcase, FileText, Palmtree, Wallet, Building2, Megaphone, AlertTriangle,
  TrendingUp, UserCheck, Clock, CheckCircle2,
} from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  const role = session?.user.role;

  if (!can(role, "data:read")) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
        Vous n&apos;avez pas l&apos;autorisation de consulter cette page.
      </div>
    );
  }

  const [
    employesTotal,
    employesActifs,
    employesConge,
    postesCount,
    departementsCount,
    contratsCount,
    congesEnAttente,
    congesApprouves,
    paiesCount,
    annoncesPubliees,
    reclamationsOuvertes,
    reclamationsHaute,
    sanctionsActives,
    employesByStatut,
    contratsByType,
    congesByType,
  ] = await Promise.all([
    prisma.employe.count(),
    prisma.employe.count({ where: { statut: "ACTIF" } }),
    prisma.employe.count({ where: { statut: "EN_CONGE" } }),
    prisma.poste.count(),
    prisma.departement.count(),
    prisma.contrat.count(),
    prisma.conge.count({ where: { statut: "EN_ATTENTE" } }),
    prisma.conge.count({ where: { statut: "APPROUVE" } }),
    prisma.paie.count(),
    prisma.annonce.count({ where: { statut: "PUBLIE" } }),
    prisma.reclamation.count({ where: { statut: { in: ["OUVERTE", "EN_COURS"] } } }),
    prisma.reclamation.count({ where: { priorite: "HAUTE", statut: { in: ["OUVERTE", "EN_COURS"] } } }),
    prisma.sanction.count({ where: { statut: "ACTIF" } }),
    prisma.employe.groupBy({ by: ["statut"], _count: true }),
    prisma.contrat.groupBy({ by: ["typeContrat"], _count: true }),
    prisma.conge.groupBy({ by: ["typeConge"], _count: true }),
  ]);

  const kpis = [
    {
      label: "Employés",
      value: employesTotal,
      sub: `${employesActifs} actifs · ${employesConge} en congé`,
      icon: Users,
      href: "/employes",
      color: "bg-indigo-50 text-indigo-600",
      ring: "ring-indigo-100",
    },
    {
      label: "Postes",
      value: postesCount,
      sub: `${departementsCount} départements`,
      icon: Briefcase,
      href: "/postes",
      color: "bg-violet-50 text-violet-600",
      ring: "ring-violet-100",
    },
    {
      label: "Contrats",
      value: contratsCount,
      sub: "Tous types confondus",
      icon: FileText,
      href: "/contrats",
      color: "bg-sky-50 text-sky-600",
      ring: "ring-sky-100",
    },
    {
      label: "Congés en attente",
      value: congesEnAttente,
      sub: `${congesApprouves} déjà approuvés`,
      icon: Clock,
      href: "/conges",
      color: "bg-amber-50 text-amber-600",
      ring: "ring-amber-100",
    },
    {
      label: "Paies enregistrées",
      value: paiesCount,
      sub: "Bulletins de paie",
      icon: Wallet,
      href: "/paies",
      color: "bg-emerald-50 text-emerald-600",
      ring: "ring-emerald-100",
    },
    {
      label: "Annonces publiées",
      value: annoncesPubliees,
      sub: "Visible par le personnel",
      icon: Megaphone,
      href: "/annonces",
      color: "bg-rose-50 text-rose-600",
      ring: "ring-rose-100",
    },
    {
      label: "Réclamations ouvertes",
      value: reclamationsOuvertes,
      sub: reclamationsHaute > 0 ? `${reclamationsHaute} prioritaires` : "Aucune haute priorité",
      icon: AlertTriangle,
      href: "/reclamations",
      color: "bg-orange-50 text-orange-600",
      ring: "ring-orange-100",
    },
    {
      label: "Sanctions actives",
      value: sanctionsActives,
      sub: "Avertissements & blâmes en cours",
      icon: AlertTriangle,
      href: "/sanctions",
      color: "bg-red-50 text-red-600",
      ring: "ring-red-100",
    },
    {
      label: "Taux d'activité",
      value: employesTotal ? Math.round((employesActifs / employesTotal) * 100) : 0,
      sub: "% d'employés actifs",
      icon: UserCheck,
      href: "/employes",
      color: "bg-teal-50 text-teal-600",
      ring: "ring-teal-100",
      suffix: "%",
    },
  ];

  const statutLabels: Record<string, string> = {
    ACTIF: "Actif",
    EN_CONGE: "En congé",
    LICENCIE: "Licencié",
    DEMISSIONNAIRE: "Démissionnaire",
  };
  const typeContratLabels: Record<string, string> = {
    CDI: "CDI", CDD: "CDD", STAGE: "Stage", PRESTATAIRE: "Prestataire",
  };
  const typeCongeLabels: Record<string, string> = {
    CONGE_PAYE: "Congé payé", MALADIE: "Maladie", MATERNITE: "Maternité", SANS_SOLDE: "Sans solde",
  };

  const maxStatut = Math.max(...employesByStatut.map((s) => s._count), 1);
  const maxContrat = Math.max(...contratsByType.map((s) => s._count), 1);
  const maxConge = Math.max(...congesByType.map((s) => s._count), 1);

  return (
    <>
      <PageHeader
        icon="layoutDashboard"
        title="Tableau de bord"
        actions={
          <p className="text-sm text-slate-500">
            Vue d&apos;ensemble RH · {new Date().toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        }
      />

      {/* KPI cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <Link
            key={k.label}
            href={k.href}
            className={`group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/40 ring-1 ring-transparent transition hover:border-indigo-200 hover:shadow-md hover:ring-indigo-50 ${k.ring}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{k.label}</p>
                <p className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-900">
                  {k.value}
                  {k.suffix ?? ""}
                </p>
                <p className="mt-1 text-xs text-slate-500">{k.sub}</p>
              </div>
              <span className={`grid h-10 w-10 place-items-center rounded-xl ${k.color}`}>
                <k.icon size={20} />
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Charts / stats */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Employés par statut */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/40">
          <div className="mb-4 flex items-center gap-2">
            <Users size={16} className="text-indigo-500" />
            <h3 className="text-sm font-semibold text-slate-800">Employés par statut</h3>
          </div>
          <ul className="space-y-3">
            {employesByStatut.map((s) => (
              <li key={s.statut}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="font-medium text-slate-600">{statutLabels[s.statut] ?? s.statut}</span>
                  <span className="tabular-nums text-slate-500">{s._count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-indigo-500 transition-all"
                    style={{ width: `${(s._count / maxStatut) * 100}%` }}
                  />
                </div>
              </li>
            ))}
            {employesByStatut.length === 0 && (
              <p className="text-sm text-slate-400">Aucune donnée</p>
            )}
          </ul>
        </div>

        {/* Contrats par type */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/40">
          <div className="mb-4 flex items-center gap-2">
            <FileText size={16} className="text-sky-500" />
            <h3 className="text-sm font-semibold text-slate-800">Contrats par type</h3>
          </div>
          <ul className="space-y-3">
            {contratsByType.map((s) => (
              <li key={s.typeContrat}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="font-medium text-slate-600">{typeContratLabels[s.typeContrat] ?? s.typeContrat}</span>
                  <span className="tabular-nums text-slate-500">{s._count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-sky-500 transition-all"
                    style={{ width: `${(s._count / maxContrat) * 100}%` }}
                  />
                </div>
              </li>
            ))}
            {contratsByType.length === 0 && (
              <p className="text-sm text-slate-400">Aucune donnée</p>
            )}
          </ul>
        </div>

        {/* Congés par type */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/40">
          <div className="mb-4 flex items-center gap-2">
            <Palmtree size={16} className="text-emerald-500" />
            <h3 className="text-sm font-semibold text-slate-800">Congés par type</h3>
          </div>
          <ul className="space-y-3">
            {congesByType.map((s) => (
              <li key={s.typeConge}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="font-medium text-slate-600">{typeCongeLabels[s.typeConge] ?? s.typeConge}</span>
                  <span className="tabular-nums text-slate-500">{s._count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${(s._count / maxConge) * 100}%` }}
                  />
                </div>
              </li>
            ))}
            {congesByType.length === 0 && (
              <p className="text-sm text-slate-400">Aucune donnée</p>
            )}
          </ul>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-8 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/40">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp size={16} className="text-indigo-500" />
          <h3 className="text-sm font-semibold text-slate-800">Accès rapide</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { href: "/employes", label: "Employés", icon: Users },
            { href: "/conges", label: "Congés", icon: Palmtree },
            { href: "/paies", label: "Paies", icon: Wallet },
            { href: "/annonces", label: "Annonces", icon: Megaphone },
            { href: "/reclamations", label: "Réclamations", icon: AlertTriangle },
            { href: "/departements", label: "Départements", icon: Building2 },
          ].map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
            >
              <a.icon size={15} />
              {a.label}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
