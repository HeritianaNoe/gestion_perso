"use client";

import { FileDown, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { downloadCsv } from "@/lib/csv";
import type { PrimeRow } from "@/lib/pdf";

const STATUT: Record<string, string> = { ACTIF: "Actif", EN_CONGE: "En congé" };

export function PrimeExportButtons({ rows, taux, q }: { rows: PrimeRow[]; taux: number; q?: string }) {
  const disabled = rows.length === 0;

  function exportCsv() {
    downloadCsv(
      "prime-anciennete.csv",
      ["Employé", "Matricule", "Statut", "Date d'embauche", "Ancienneté (ans)", "Salaire de base", "Majoration (%)", "Prime / mois", "Salaire avec prime"],
      rows.map((r) => [
        r.nom, r.matricule, STATUT[r.statut] ?? r.statut, r.dateEmbauche.slice(0, 10), r.annees,
        r.base ?? "", r.pourcentage ?? "", r.prime ?? "", r.total ?? "",
      ]),
    );
  }

  return (
    <>
      <Button variant="secondary" className="gap-1.5" disabled={disabled} onClick={async () => (await import("@/lib/pdf")).generatePrimeAnciennetePdf(rows, taux, q)}>
        <FileDown size={15} /> PDF
      </Button>
      <Button variant="secondary" className="gap-1.5" disabled={disabled} onClick={exportCsv}>
        <FileSpreadsheet size={15} /> CSV
      </Button>
    </>
  );
}
