"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Mail, ShieldCheck, Users } from "lucide-react";
import { cn } from "@/lib/cn";
import { AppIcon } from "@/components/ui/AppIcon";
import type { IconName } from "@/components/crud/types";

export type NavItem = { href: string; label: string; icon: IconName };
export type NavGroup = { label: string; items: NavItem[] };

export function Sidebar({
  groups, email, role, signOutAction,
}: {
  groups: NavGroup[];
  email?: string;
  role?: string;
  signOutAction: () => Promise<void>;
}) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-slate-200/80 bg-white">
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-200">
          <Users size={20} aria-hidden="true" />
        </span>
        <div>
          <p className="text-base font-semibold tracking-tight text-slate-900">Gestion RH</p>
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Personnel</p>
        </div>
      </div>

      <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-4 scrollbar-thin">
        {groups.map((g) => (
          <div key={g.label}>
            <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {g.label}
            </p>
            <div className="space-y-0.5">
              {g.items.map((i) => {
                const active =
                  i.href === "/dashboard"
                    ? pathname === "/dashboard" || pathname === "/"
                    : pathname.startsWith(i.href);
                return (
                  <Link
                    key={i.href}
                    href={i.href}
                    className={cn(
                      "group flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                      active
                        ? "bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100/50"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                    )}
                  >
                    <span
                      className={cn(
                        "grid h-8 w-8 place-items-center rounded-lg transition-colors",
                        active
                          ? "bg-indigo-100 text-indigo-600"
                          : "bg-slate-100 text-slate-500 group-hover:bg-slate-200/80 group-hover:text-slate-700",
                      )}
                    >
                      <AppIcon name={i.icon} size={16} />
                    </span>
                    {i.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-4">
        <div className="mb-3 space-y-1.5">
          <p className="flex items-center gap-2 truncate text-xs text-slate-500">
            <Mail size={13} className="shrink-0 text-slate-400" aria-hidden="true" />
            <span className="truncate">{email}</span>
          </p>
          <p className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck size={13} className="shrink-0 text-slate-400" aria-hidden="true" />
            <span className="font-medium capitalize text-slate-600">{role}</span>
          </p>
        </div>
        <form action={signOutAction}>
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={14} />
            Se déconnecter
          </button>
        </form>
      </div>
    </aside>
  );
}
