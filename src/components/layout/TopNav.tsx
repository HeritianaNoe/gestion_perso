"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bell, FileText, LogOut, Wallet } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { fmtDate } from "@/components/crud/format";
import type { EmployeAlert } from "@/lib/notifications";

export function TopNav({
  signOutAction, alerts, alertsTotal = 0,
}: {
  signOutAction: () => Promise<void>;
  alerts?: EmployeAlert[];
  alertsTotal?: number;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const items = alerts ?? [];

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-end gap-3 border-b border-slate-200/80 bg-white/90 px-6 backdrop-blur-sm lg:px-8">
      {alerts && (
        <div className="relative" ref={ref}>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={`Notifications (${alertsTotal})`}
            aria-expanded={open}
            className="relative grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
          >
            <Bell size={16} />
            {alertsTotal > 0 && (
              <span className="absolute -right-1.5 -top-1.5 grid min-w-[18px] place-items-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-[18px] text-white">
                {alertsTotal > 99 ? "99+" : alertsTotal}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-96 max-w-[90vw] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
              <div className="border-b border-slate-100 px-4 py-3">
                <p className="text-sm font-semibold text-slate-900">Notifications</p>
                <p className="text-xs text-slate-500">
                  {alertsTotal > 0
                    ? `${alertsTotal} employé${alertsTotal > 1 ? "s" : ""} sans contrat ou sans paie`
                    : "Rien à signaler"}
                </p>
              </div>
              <ul className="max-h-96 divide-y divide-slate-100 overflow-y-auto">
                {items.length === 0 && (
                  <li className="px-4 py-8 text-center text-sm text-slate-400">
                    Tous les employés ont un contrat et une paie.
                  </li>
                )}
                {items.map((a) => (
                  <li key={a.id} className="flex items-start gap-3 px-4 py-3">
                    <Avatar id={a.id} alt={a.nom} size={32} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800">{a.nom}</p>
                      <p className="text-xs text-slate-400">
                        {a.matricule} · embauché le {fmtDate(a.dateEmbauche)}
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {a.sansContrat && (
                          <Link
                            href="/contrats"
                            onClick={() => setOpen(false)}
                            className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20 hover:bg-amber-100"
                          >
                            <FileText size={11} /> Pas de contrat
                          </Link>
                        )}
                        {a.sansPaie && (
                          <Link
                            href="/paies"
                            onClick={() => setOpen(false)}
                            className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700 ring-1 ring-inset ring-red-600/20 hover:bg-red-100"
                          >
                            <Wallet size={11} /> Pas de paie
                          </Link>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              {alertsTotal > items.length && (
                <p className="border-t border-slate-100 px-4 py-2 text-center text-xs text-slate-400">
                  + {alertsTotal - items.length} autre(s)
                </p>
              )}
            </div>
          )}
        </div>
      )}

      <form action={signOutAction}>
        <button
          type="submit"
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={14} />
          <span className="hidden sm:inline">Se déconnecter</span>
        </button>
      </form>
    </header>
  );
}
