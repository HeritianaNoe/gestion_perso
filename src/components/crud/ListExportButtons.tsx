"use client";

import { useState } from "react";
import { FileDown, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { exportRecords } from "@/app/actions/crud";
import { downloadCsv } from "@/lib/csv";

const STATUT_EMPLOYE: Record<string, string> = {
  ACTIF: "Actif", EN_CONGE: "En congé", LICENCIE: "Licencié", DEMISSIONNAIRE: "Démissionnaire",
};
const TYPE_SANCTION: Record<string, string> = {
  AVERTISSEMENT_ORAL: "Avertissement oral",
  AVERTISSEMENT_ECRIT: "Avertissement écrit",
  BLAME: "Blâme",
  MISE_A_PIED: "Mise à pied",
  RETENUE_SALAIRE: "Retenue sur salaire",
};
const day = (v: any) => (v ? String(v).slice(0, 10) : "");

/** Boutons PDF + CSV d'un tableau (toutes les pages, selon la recherche en cours). */
export function ListExportButtons({
  resource, q, total,
}: { resource: "employes" | "sanctions"; q?: string; total: number }) {
  const [busy, setBusy] = useState<"pdf" | "csv" | null>(null);
  const disabled = total === 0 || busy !== null;

  async function run(kind: "pdf" | "csv") {
    setBusy(kind);
    try {
      const r = await exportRecords(resource, q);
      if (!r.ok) return alert(r.message);
      const items = r.items;

      if (resource === "employes") {
        if (kind === "pdf") return (await import("@/lib/pdf")).generateEmployesListPdf(items, q);
        downloadCsv(
          "employes.csv",
          ["Nom", "Prénom", "Matricule", "Poste", "Statut", "Email", "Téléphone", "Date de naissance", "Sexe", "Adresse", "Date d'embauche"],
          items.map((e: any) => [
            e.nom ?? "", e.prenom ?? "", e.matricule ?? "", e.poste?.intitule ?? "",
            STATUT_EMPLOYE[e.statut] ?? e.statut ?? "", e.email ?? "", e.telephone ?? "",
            day(e.dateNaissance), e.sexe ?? "", e.adresse ?? "", day(e.dateEmbauche),
          ]),
        );
      } else {
        if (kind === "pdf") return (await import("@/lib/pdf")).generateSanctionsListPdf(items, q);
        downloadCsv(
          "sanctions-avertissements.csv",
          ["Employé", "Matricule", "Type", "Date", "Motif", "Description", "Statut"],
          items.map((s: any) => [
            s.employe ? `${s.employe.prenom} ${s.employe.nom}` : "", s.employe?.matricule ?? "",
            TYPE_SANCTION[s.type] ?? s.type ?? "", day(s.date), s.motif ?? "", s.description ?? "",
            s.statut === "LEVE" ? "Levé" : "Actif",
          ]),
        );
      }
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <Button variant="secondary" className="gap-1.5" disabled={disabled} onClick={() => run("pdf")}>
        <FileDown size={15} /> {busy === "pdf" ? "Génération…" : "PDF"}
      </Button>
      <Button variant="secondary" className="gap-1.5" disabled={disabled} onClick={() => run("csv")}>
        <FileSpreadsheet size={15} /> {busy === "csv" ? "Génération…" : "CSV"}
      </Button>
    </>
  );
}
