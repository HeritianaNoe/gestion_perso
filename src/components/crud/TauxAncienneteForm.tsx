"use client";

import { useActionState } from "react";
import { CheckCircle2, Save } from "lucide-react";
import { saveTauxAnciennete } from "@/app/actions/parametres";
import { Input } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";

export function TauxAncienneteForm({ taux, canWrite }: { taux: number; canWrite: boolean }) {
  const [state, action] = useActionState(saveTauxAnciennete, undefined);

  return (
    <form action={action} className="space-y-4">
      <div className="max-w-xs">
        <Input
          label="Taux par année d'ancienneté (%)"
          name="taux"
          icon="gift"
          type="number"
          min={0}
          max={100}
          step="0.01"
          defaultValue={taux}
          disabled={!canWrite}
          required
          error={state && !state.ok && state.error ? [state.error] : undefined}
        />
      </div>

      {state?.ok && state.message && (
        <p className="flex items-center gap-1.5 text-sm text-emerald-700" role="status">
          <CheckCircle2 size={15} aria-hidden="true" /> {state.message}
        </p>
      )}

      {canWrite ? (
        <SubmitButton pendingText="Enregistrement..." className="gap-1.5">
          <Save size={16} /> Enregistrer
        </SubmitButton>
      ) : (
        <p className="text-xs text-slate-400">Lecture seule : seuls les rôles Admin et RH peuvent modifier ce taux.</p>
      )}
    </form>
  );
}
