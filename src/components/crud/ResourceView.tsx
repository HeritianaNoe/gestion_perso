"use client";

import { useState, useTransition } from "react";
import { Eye, FileDown, Pencil, Plus, Trash2, X } from "lucide-react";
import { deleteRecord } from "@/app/actions/crud";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Modal } from "@/components/ui/Modal";
import { ResourceForm } from "./ResourceForm";
import { Avatar } from "@/components/ui/Avatar";
import { AppIcon } from "@/components/ui/AppIcon";
import { display } from "./format";
import {
  generateEmployePdf,
  generateContratPdf,
  generateCongePdf,
  generateSanctionPdf,
} from "@/lib/pdf";
import type { ClientResource, Relations, Row } from "./types";

type ModalState = { mode: "create" | "edit" | "view"; row?: Row } | null;

export function ResourceView({
  res, rows, total, relations, canWrite, canDelete,
}: {
  res: ClientResource; rows: Row[]; total: number; relations: Relations;
  canWrite: boolean; canDelete: boolean;
}) {
  const [modal, setModal] = useState<ModalState>(null);
  const [pending, startTransition] = useTransition();
  const close = () => setModal(null);
  const columns = res.fields.filter((f) => f.list);
  const imageField = res.fields.find((f) => f.type === "image");

  function remove(row: Row) {
    const warn = res.deleteWarning ? `\n\n${res.deleteWarning}` : "";
    if (!confirm(`Supprimer ce(tte) ${res.singular.toLowerCase()} #${row.id} ?${warn}`)) return;
    startTransition(async () => {
      const r = await deleteRecord(res.key, row.id);
      if (!r.ok) alert(r.message ?? "La suppression a échoué.");
    });
  }

  return (
    <>
      <PageHeader
        icon={res.icon}
        title={`${res.plural} (${total})`}
        actions={
          <>
            <SearchInput placeholder="Rechercher..." />
            {canWrite && (
              <Button onClick={() => setModal({ mode: "create" })} className="gap-1.5">
                <Plus size={16} /> Nouveau
              </Button>
            )}
          </>
        }
      />

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/50">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80">
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">#</th>
                {columns.map((f) => (
                  <th key={f.name} className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                      <AppIcon name={f.icon} size={13} className="text-slate-400" />
                      {f.label}
                    </span>
                  </th>
                ))}
                <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={columns.length + 2} className="px-5 py-16 text-center">
                    <div className="mx-auto flex max-w-xs flex-col items-center gap-2">
                      <div className="grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-400">
                        <AppIcon name={res.icon} size={22} />
                      </div>
                      <p className="text-sm font-medium text-slate-600">Aucune donnée</p>
                      <p className="text-xs text-slate-400">
                        {canWrite ? "Cliquez sur « Nouveau » pour ajouter un enregistrement." : "Aucun enregistrement trouvé."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
              {rows.map((row) => (
                <tr key={row.id} className="group transition-colors hover:bg-indigo-50/30">
                  <td className="px-5 py-3.5 tabular-nums text-slate-400">{row.id}</td>
                  {columns.map((f) => (
                    <td key={f.name} className="max-w-xs truncate px-5 py-3.5 text-slate-700">
                      {display(f, row[f.name], relations, row)}
                    </td>
                  ))}
                  <td className="px-5 py-2.5">
                    <div className="flex justify-end gap-0.5 opacity-70 transition-opacity group-hover:opacity-100">
                      <IconButton tone="view" label="Voir" onClick={() => setModal({ mode: "view", row })}>
                        <Eye size={17} />
                      </IconButton>
                      {["employes", "contrats", "conges", "sanctions"].includes(res.key) && (
                        <IconButton
                          tone="view"
                          label="PDF"
                          onClick={() => {
                            if (res.key === "employes") generateEmployePdf(row, relations);
                            else if (res.key === "contrats") generateContratPdf(row, relations);
                            else if (res.key === "conges") generateCongePdf(row, relations);
                            else if (res.key === "sanctions") generateSanctionPdf(row, relations);
                          }}
                        >
                          <FileDown size={17} />
                        </IconButton>
                      )}
                      {canWrite && (
                        <IconButton tone="edit" label="Modifier" onClick={() => setModal({ mode: "edit", row })}>
                          <Pencil size={17} />
                        </IconButton>
                      )}
                      {canDelete && (
                        <IconButton tone="delete" label="Supprimer" disabled={pending} onClick={() => remove(row)}>
                          <Trash2 size={17} />
                        </IconButton>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal?.mode === "view" && modal.row && (
        <Modal title={`${res.singular} #${modal.row.id}`} onClose={close}>
          {imageField && (
            <div className="mb-6 flex items-center gap-5">
              <Avatar
                size={96}
                photo={modal.row[imageField.name]}
                sexe={modal.row.sexe}
                id={modal.row.id}
                alt={`Photo ${modal.row.prenom ?? ""} ${modal.row.nom ?? ""}`.trim()}
              />
              {modal.row.nom && (
                <div>
                  <p className="text-lg font-semibold tracking-tight text-slate-900">
                    {modal.row.prenom} {modal.row.nom}
                  </p>
                  <p className="mt-0.5 text-sm text-slate-500">{modal.row.matricule}</p>
                </div>
              )}
            </div>
          )}
          <dl className="grid grid-cols-1 gap-x-8 gap-y-4 text-sm md:grid-cols-2">
            {res.fields
              .filter((f) => f.type !== "image")
              .map((f) => (
                <div key={f.name} className={f.type === "textarea" ? "md:col-span-2" : ""}>
                  <dt className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-slate-400">
                    <AppIcon name={f.icon} size={12} />
                    {f.label}
                  </dt>
                  <dd className="whitespace-pre-wrap text-slate-800">
                    {display(f, modal.row![f.name], relations, modal.row)}
                  </dd>
                </div>
              ))}
          </dl>
          <div className="mt-8 flex flex-wrap justify-end gap-2.5 border-t border-slate-100 pt-5">
            {["employes", "contrats", "conges", "sanctions"].includes(res.key) && (
              <Button
                variant="secondary"
                className="gap-1.5"
                onClick={() => {
                  const row = modal.row!;
                  if (res.key === "employes") generateEmployePdf(row, relations);
                  else if (res.key === "contrats") generateContratPdf(row, relations);
                  else if (res.key === "conges") generateCongePdf(row, relations);
                  else if (res.key === "sanctions") generateSanctionPdf(row, relations);
                }}
              >
                <FileDown size={15} /> PDF
              </Button>
            )}
            {canWrite && (
              <Button
                variant="secondary"
                className="gap-1.5"
                onClick={() => setModal({ mode: "edit", row: modal.row })}
              >
                <Pencil size={15} /> Modifier
              </Button>
            )}
            <Button className="gap-1.5" onClick={close}>
              <X size={15} /> Fermer
            </Button>
          </div>
        </Modal>
      )}

      {(modal?.mode === "create" || modal?.mode === "edit") && (
        <Modal
          title={modal.mode === "create" ? `Nouveau : ${res.singular}` : `Modifier : ${res.singular} #${modal.row?.id}`}
          onClose={close}
        >
          <ResourceForm res={res} relations={relations} row={modal.row} onDone={close} />
        </Modal>
      )}
    </>
  );
}
