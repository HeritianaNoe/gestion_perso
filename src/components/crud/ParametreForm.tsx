"use client";

import { useActionState } from "react";
import { CheckCircle2, Save } from "lucide-react";
import type { ParamState } from "@/app/actions/parametres";
import { Input } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import type { IconName } from "./types";

/** Formulaire d'un paramètre numérique ; l'action serveur et le libellé viennent de la page. */
export function ParametreForm({
  action, label, icon, value, max, step = "0.01", canWrite,
}: {
  action: (prev: ParamState, formData: FormData) => Promise<ParamState>;
  label: string;
  icon?: IconName;
  value: number;
  max: number;
  step?: string;
  canWrite: boolean;
}) {
  const [state, formAction] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div className="max-w-xs">
        <Input
          label={label}
          name="valeur"
          icon={icon}
          type="number"
          min={0}
          max={max}
          step={step}
          defaultValue={value}
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
        <p className="text-xs text-slate-400">Lecture seule : seuls les rôles Admin et RH peuvent modifier ce paramètre.</p>
      )}
    </form>
  );
}
