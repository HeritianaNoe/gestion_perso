"use client";

import { useActionState } from "react";
import { ACCESS_RESOURCES, STAFF_ROLES, ROLE_LABEL } from "@/lib/rbac";
import { saveAccessMatrix, type AccessFormState } from "@/app/actions/parametres";

const initial: AccessFormState = { ok: false };

export function AccessMatrix({
  matrix,
  canEdit,
}: {
  matrix: Record<string, boolean>;
  canEdit: boolean;
}) {
  const [state, formAction, pending] = useActionState(saveAccessMatrix, initial);

  return (
    <section id="access" className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-200/40">
      <h2 className="text-base font-semibold text-slate-900">Accès du personnel</h2>
      <p className="mt-1 mb-5 text-sm text-slate-500">
        Cochez les modules autorisés pour chaque rôle.
        {canEdit
          ? " Seuls l'administrateur et le directeur peuvent modifier et enregistrer."
          : " Lecture seule — seuls l'administrateur et le directeur peuvent modifier."}
      </p>

      <form action={formAction}>
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/80 text-slate-600">
              <tr>
                <th className="px-3 py-2.5 font-medium">Module</th>
                {STAFF_ROLES.map((role) => (
                  <th key={role} className="px-2 py-2.5 text-center font-medium">
                    <span className="block text-xs leading-tight">{ROLE_LABEL[role]}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {ACCESS_RESOURCES.map((res) => (
                <tr key={res.key} className="hover:bg-slate-50/50">
                  <td className="px-3 py-2.5 font-medium text-slate-800">{res.label}</td>
                  {STAFF_ROLES.map((role) => {
                    const locked =
                      res.key === "access" && (role === "ADMIN" || role === "DIRECTOR");
                    const key = `${role}:${res.key}`;
                    const checked = locked || !!matrix[key];
                    const name = `access_${role}_${res.key}`;
                    return (
                      <td key={role} className="px-2 py-2.5 text-center">
                        <input
                          type="checkbox"
                          name={name}
                          value="on"
                          defaultChecked={checked}
                          disabled={!canEdit || locked}
                          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-60"
                          aria-label={`${ROLE_LABEL[role]} — ${res.label}`}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {(state?.message || state?.error) && (
          <p
            role="alert"
            className={`mt-3 text-sm ${state.ok ? "text-emerald-700" : "text-red-600"}`}
          >
            {state.message || state.error}
          </p>
        )}

        {canEdit && (
          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              disabled={pending}
              className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60"
            >
              {pending ? "Enregistrement…" : "Enregistrer les accès"}
            </button>
          </div>
        )}
      </form>
    </section>
  );
}
