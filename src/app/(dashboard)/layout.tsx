import { auth, signOut } from "@/auth";
import { can } from "@/lib/rbac";
import { getResource, NAV_GROUPS } from "@/lib/resources";
import { Sidebar, type NavGroup } from "@/components/layout/Sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const role = session?.user.role;

  const groups: NavGroup[] = [];

  if (can(role, "data:read")) {
    groups.push({
      label: "Principal",
      items: [{ href: "/dashboard", label: "Tableau de bord", icon: "layoutDashboard" }],
    });

    for (const g of NAV_GROUPS) {
      const items = g.keys
        .map((key) => {
          const r = getResource(key);
          if (!r) return null;
          return { href: `/${r.key}`, label: r.plural, icon: r.icon };
        })
        .filter(Boolean) as NavGroup["items"];
      if (items.length) groups.push({ label: g.label, items });
    }
  }

  async function signOutAction() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar groups={groups} email={session?.user.email} role={role} signOutAction={signOutAction} />
      <div className="min-w-0 flex-1">
        <main className="mx-auto max-w-7xl px-6 py-8 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
