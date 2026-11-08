import { auth, signOut } from "@/auth";
import { can } from "@/lib/rbac";
import { getResource, NAV_GROUPS } from "@/lib/resources";
import { Sidebar, type NavGroup } from "@/components/layout/Sidebar";
import { getEmployeAlerts } from "@/lib/notifications";
import { TopNav } from "@/components/layout/TopNav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const role = session?.user.role;

  const groups: NavGroup[] = [];
  const alerts = can(role, "data:read") ? await getEmployeAlerts() : null;

  if (can(role, "data:read")) {
    groups.push({
      label: "Principal",
      items: [{ href: "/dashboard", label: "Tableau de bord", icon: "layoutDashboard" }],
    });

    // Pages calculées (hors CRUD) rattachées à un groupe existant du menu
    const extras: Record<string, NavGroup["items"]> = {
      "Contrats & Paie": [
        { href: "/prime-anciennete", label: "Prime d'ancienneté", icon: "gift" },
        { href: "/masse-salariale", label: "Masse salariale", icon: "chart" },
      ],
      "Absences": [{ href: "/soldes-conges", label: "Soldes de congés", icon: "balance" }],
    };

    for (const g of NAV_GROUPS) {
      const items = g.keys
        .map((key) => {
          const r = getResource(key);
          if (!r) return null;
          return { href: `/${r.key}`, label: r.plural, icon: r.icon };
        })
        .filter(Boolean) as NavGroup["items"];
      items.push(...(extras[g.label] ?? []));
      if (items.length) groups.push({ label: g.label, items });
    }

    groups.push({
      label: "Configuration",
      items: [{ href: "/parametres", label: "Paramètres", icon: "settings" }],
    });
  }

  async function signOutAction() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar groups={groups} email={session?.user.email} role={role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopNav signOutAction={signOutAction} alerts={alerts?.items} alertsTotal={alerts?.total} />
        <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
