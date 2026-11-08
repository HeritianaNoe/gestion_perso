"use client";

import { useEffect } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { Button } from "./Button";

/** Boîte de confirmation centrée à l'écran, sur fond clair. */
export function ConfirmDialog({
  title, message, warning, error, confirmLabel = "Supprimer", pending = false, onConfirm, onCancel,
}: {
  title: string;
  message: React.ReactNode;
  warning?: string;
  error?: string;
  confirmLabel?: string;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !pending && onCancel();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel, pending]);

  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-center bg-slate-500/20 p-4 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && !pending && onCancel()}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-2xl shadow-slate-400/30"
      >
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-red-50 text-red-500 ring-8 ring-red-50/60">
          <Trash2 size={26} aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-lg font-semibold tracking-tight text-slate-900">{title}</h2>
        <p className="mt-1.5 text-sm text-slate-600">{message}</p>

        {warning && (
          <p className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-left text-xs text-amber-800">
            <AlertTriangle size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span>{warning}</span>
          </p>
        )}
        {error && (
          <p className="mt-3 rounded-xl border border-red-100 bg-red-50 px-3.5 py-2.5 text-left text-xs text-red-700">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-center gap-2.5">
          <Button type="button" variant="secondary" className="gap-1.5" disabled={pending} onClick={onCancel}>
            <X size={15} /> Annuler
          </Button>
          <Button type="button" variant="danger" className="gap-1.5" disabled={pending} onClick={onConfirm}>
            <Trash2 size={15} /> {pending ? "Suppression…" : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
