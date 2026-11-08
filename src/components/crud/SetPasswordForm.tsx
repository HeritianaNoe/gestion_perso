"use client";

import { useActionState, useEffect, useState } from "react";
import { KeyRound, Lock } from "lucide-react";
import { setEmployePassword, type PasswordState } from "@/app/actions/password";
import { Button } from "@/components/ui/Button";
import { SubmitButton } from "@/components/ui/SubmitButton";

export function SetPasswordForm({
  employeId,
  email,
}: {
  employeId: number;
  email?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState(
    setEmployePassword.bind(null, employeId) as (
      prev: PasswordState,
      formData: FormData,
    ) => Promise<PasswordState>,
    undefined,
  );

  useEffect(() => {
    if (state?.ok) {
      // Garder le message de succès visible un moment puis fermer
      const t = setTimeout(() => setOpen(false), 2500);
      return () => clearTimeout(t);
    }
  }, [state]);

  if (!email) {
    return (
      <p className="text-xs text-amber-600">
        Impossible de définir un mot de passe : pas d&apos;email.
      </p>
    );
  }

  if (!open) {
    return (
      <Button
        type="button"
        variant="secondary"
        className="gap-1.5"
        onClick={() => setOpen(true)}
      >
        <KeyRound size={15} /> Mot de passe
      </Button>
    );
  }

  return (
    <div className="w-full rounded-xl border border-slate-200 bg-slate-50/80 p-4 md:col-span-2">
      <p className="mb-3 text-xs font-medium text-slate-600">
        Définir / modifier le mot de passe de connexion pour{" "}
        <span className="font-semibold text-slate-800">{email}</span>
      </p>
      <form action={action} className="space-y-3">
        <div className="relative">
          <Lock
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            name="password"
            type="password"
            required
            minLength={8}
            placeholder="Nouveau mot de passe (min. 8)"
            autoComplete="new-password"
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        <div className="relative">
          <Lock
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            name="confirm"
            type="password"
            required
            minLength={8}
            placeholder="Confirmer le mot de passe"
            autoComplete="new-password"
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        {state && (
          <p
            className={`text-xs ${state.ok ? "text-emerald-600" : "text-red-600"}`}
          >
            {state.message}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <SubmitButton className="gap-1.5">
            <KeyRound size={14} /> Enregistrer
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}
