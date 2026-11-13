import { auth, signOut } from "@/auth";
import { can, canAccessModule, resourceForHref, type ResourceAccessKey } from "@/lib/rbac";
import { getResource, NAV_GROUPS } from "@/lib/resources";
import { Sidebar, type NavGroup } from "@/components/layout/Sidebar";
import { getEmployeAlerts } from "@/lib/notifications";
import { TopNav } from "@/components/layout/TopNav";
import { getRoleAccessMap } from "@/lib/parametres";
import type { Role } from "@prisma/client";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const role = session?.user.role as Role | undefined;
  const accessMap = await getRoleAccessMap();

  const groups: NavGroup[] = [];
  const alerts = can(role, "data:read") ? await getEmployeAlerts() : null;

  function allowed(href: string): boolean {
    const res = resourceForHref(href);
    if (!res) return true;
    return canAccessModule(role, res as ResourceAccessKey, accessMap);
  }

  if (can(role, "data:read")) {
    if (allowed("/dashboard")) {
      groups.push({
        label: "Principal",
        items: [{ href: "/dashboard", label: "Tableau de bord", icon: "layoutDashboard" }],
      });
    }

    const extras: Record<string, NavGroup["items"]> = {
      "Contrats & Paie": [
        { href: "/prime-anciennete", label: "Prime d'ancienneté", icon: "gift" },
        { href: "/masse-salariale", label: "Masse salariale", icon: "chart" },
      ],
      Absences: [{ href: "/soldes-conges", label: "Soldes de congés", icon: "balance" }],
    };

    for (const g of NAV_GROUPS) {
      const items = g.keys
        .map((key) => {
          const r = getResource(key);
          if (!r) return null;
          const href = `/${r.key}`;
          if (!allowed(href)) return null;
          return { href, label: r.plural, icon: r.icon };
        })
        .filter(Boolean) as NavGroup["items"];
      for (const extra of extras[g.label] ?? []) {
        if (allowed(extra.href)) items.push(extra);
      }
      if (items.length) groups.push({ label: g.label, items });
    }

    if (allowed("/parametres")) {
      groups.push({
        label: "Configuration",
        items: [{ href: "/parametres", label: "Paramètres", icon: "settings" }],
      });
    }
  }

  async function signOutAction() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar groups={groups} email={session?.user.email} role={role} />
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Spacer mobile top bar */}
        <div className="h-14 lg:hidden" aria-hidden="true" />
        <TopNav signOutAction={signOutAction} alerts={alerts?.items} alertsTotal={alerts?.total} />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
