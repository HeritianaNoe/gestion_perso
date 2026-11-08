"use client";

import { FileDown, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { downloadCsv } from "@/lib/csv";
import type { SoldeRow } from "@/lib/pdf";

const STATUT_LABELS: Record<string, string> = {
  ACTIF: "Actif",
  EN_CONGE: "En congé",
  LICENCIE: "Licencié",
  DEMISSIONNAIRE: "Démissionnaire",
};

export function SoldesExportButtons({
  rows,
  joursParMois,
}: {
  rows: SoldeRow[];
  joursParMois: number;
}) {
  const disabled = rows.length === 0;

  function exportCsv() {
    downloadCsv(
      "soldes-conges.csv",
      ["Employé", "Matricule", "Statut", "Date embauche", "Mois de service", "Acquis", "Pris", "En attente", "Solde"],
      rows.map((r) => [
        r.nom,
        r.matricule,
        STATUT_LABELS[r.statut] ?? r.statut,
        r.dateEmbauche.slice(0, 10),
        r.mois,
        r.acquis,
        r.pris,
        r.enAttente,
        r.solde,
      ]),
    );
  }

  return (
    <>
      <Button
        variant="secondary"
        className="gap-1.5"
        disabled={disabled}
        onClick={async () => (await import("@/lib/pdf")).generateSoldesCongesPdf(rows, joursParMois)}
      >
        <FileDown size={15} /> PDF
      </Button>
      <Button variant="secondary" className="gap-1.5" disabled={disabled} onClick={exportCsv}>
        <FileSpreadsheet size={15} /> CSV
      </Button>
    </>
  );
}

/** @deprecated Prefer SoldesExportButtons */
export function SoldesPdfButton({ rows, joursParMois }: { rows: SoldeRow[]; joursParMois: number }) {
  return <SoldesExportButtons rows={rows} joursParMois={joursParMois} />;
}
