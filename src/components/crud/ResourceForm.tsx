"use client";

import { useActionState, useEffect } from "react";
import { saveRecord } from "@/app/actions/crud";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Button } from "@/components/ui/Button";
import { ImageField } from "./ImageField";
import { Plus, Save, X } from "lucide-react";
import type { ClientResource, FieldDef, Relations, Row } from "./types";

function initial(f: FieldDef, row?: Row) {
  const v = row?.[f.name];
  if (v === null || v === undefined) return row ? "" : f.defaultValue ?? "";
  return f.type === "date" ? String(v).slice(0, 10) : String(v);
}

export function ResourceForm({
  res, relations, row, onDone,
}: { res: ClientResource; relations: Relations; row?: Row; onDone: () => void }) {
  const [state, action] = useActionState(saveRecord.bind(null, res.key, row?.id ?? null), undefined);
  const errors = state && !state.ok ? state.errors : undefined;

  useEffect(() => {
    if (state?.ok) onDone();
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <form action={action} className="grid grid-cols-1 gap-5 md:grid-cols-2">
      {res.fields.map((f) => {
        const common = {
          key: f.name,
          label: f.label + (f.required ? " *" : ""),
          name: f.name,
          icon: f.icon,
          defaultValue: initial(f, row),
          error: errors?.[f.name] ? [errors[f.name]] : undefined,
        };
        if (f.type === "image")
          return <ImageField key={f.name} f={f} row={row} error={errors?.[f.name]} />;
        if (f.type === "textarea")
          return (
            <div key={f.name} className="md:col-span-2">
              <Textarea {...common} />
            </div>
          );
        if (f.type === "enum" || f.type === "relation") {
          const options = f.type === "enum" ? f.options ?? [] : relations[f.relation!] ?? [];
          return (
            <Select
              {...common}
              options={options}
              placeholder={f.required ? "— Sélectionner —" : "— Aucun —"}
            />
          );
        }
        const htmlType =
          f.type === "int" || f.type === "decimal" ? "number" : f.type === "date" ? "date" : f.type;
        return (
          <Input
            {...common}
            type={htmlType}
            min={f.min ?? (f.type === "decimal" ? 0 : undefined)}
            max={f.max}
            step={f.type === "decimal" ? "0.01" : f.type === "int" ? "1" : undefined}
            maxLength={f.maxLength}
          />
        );
      })}

      {state && !state.ok && state.message && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 md:col-span-2">
          {state.message}
        </div>
      )}

      <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-5 md:col-span-2">
        <Button type="button" variant="secondary" className="gap-1.5" onClick={onDone}>
          <X size={16} /> Annuler
        </Button>
        <SubmitButton pendingText="Enregistrement..." className="gap-1.5">
          {row ? (
            <>
              <Save size={16} /> Enregistrer les modifications
            </>
          ) : (
            <>
              <Plus size={16} /> Ajouter
            </>
          )}
        </SubmitButton>
      </div>
    </form>
  );
}
