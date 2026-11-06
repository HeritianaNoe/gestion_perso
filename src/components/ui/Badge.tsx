import { CheckCircle2, Clock, Lock, LogOut, Palmtree, Unlock, XCircle, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

const tones: Record<string, string> = {
  ACTIF: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20",
  APPROUVE: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20",
  OUVERT: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20",
  EN_CONGE: "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-600/20",
  EN_ATTENTE: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20",
  REFUSE: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20",
  LICENCIE: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20",
  DEMISSIONNAIRE: "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/20",
  FERME: "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/20",
};

const icons: Record<string, LucideIcon> = {
  ACTIF: CheckCircle2,
  APPROUVE: CheckCircle2,
  OUVERT: Unlock,
  EN_CONGE: Palmtree,
  EN_ATTENTE: Clock,
  REFUSE: XCircle,
  LICENCIE: XCircle,
  DEMISSIONNAIRE: LogOut,
  FERME: Lock,
};

export function Badge({ value, label }: { value: string; label?: string }) {
  const Icon = icons[value];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium",
        tones[value] ?? "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/20",
      )}
    >
      {Icon && <Icon size={12} aria-hidden="true" />}
      {label ?? value.replace(/_/g, " ")}
    </span>
  );
}
