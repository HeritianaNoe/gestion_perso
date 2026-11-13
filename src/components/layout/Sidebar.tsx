"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Mail, Menu, ShieldCheck, Users, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { AppIcon } from "@/components/ui/AppIcon";
import type { IconName } from "@/components/crud/types";

export type NavItem = { href: string; label: string; icon: IconName };
export type NavGroup = { label: string; items: NavItem[] };

export function Sidebar({
  groups,
  email,
  role,
}: {
  groups: NavGroup[];
  email?: string;
  role?: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const NavBody = (
    <>
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-200">
          <Users size={20} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold tracking-tight text-slate-900">Gestion RH</p>
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Personnel</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 lg:hidden"
          aria-label="Fermer le menu"
        >
          <X size={18} />
        </button>
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
        <div className="flex items-center gap-3">
          <div
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-indigo-100 text-indigo-700 ring-2 ring-indigo-50"
            title={email}
          >
            <span className="text-sm font-semibold leading-none">
              {email ? email.charAt(0).toUpperCase() : "?"}
            </span>
          </div>
          <div className="min-w-0 space-y-0.5">
            <p className="flex items-center gap-1.5 truncate text-xs text-slate-500">
              <Mail size={12} className="shrink-0 text-slate-400" aria-hidden="true" />
              <span className="truncate">{email}</span>
            </p>
            <p className="flex items-center gap-1.5 text-xs text-slate-500">
              <ShieldCheck size={12} className="shrink-0 text-slate-400" aria-hidden="true" />
              <span className="font-medium capitalize text-slate-600">{role}</span>
            </p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center gap-3 border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
          aria-label="Ouvrir le menu"
        >
          <Menu size={18} />
        </button>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-indigo-600 text-white">
            <Users size={14} />
          </span>
          <span className="truncate text-sm font-semibold text-slate-900">Gestion RH</span>
        </div>
      </div>

      {/* Overlay mobile */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-slate-900/40 transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setOpen(false)}
        aria-hidden={!open}
      />

      {/* Drawer mobile */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-slate-200/80 bg-white shadow-xl transition-transform duration-200 lg:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {NavBody}
      </aside>

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-slate-200/80 bg-white lg:flex">
        {NavBody}
      </aside>
    </>
  );
}
