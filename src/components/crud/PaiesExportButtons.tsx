"use client";

import { useState } from "react";
import { FileDown, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { exportRecords } from "@/app/actions/crud";
import { downloadCsv } from "@/lib/csv";

const MOIS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

function fmtMoney(v: any): string {
  if (v == null || v === "") return "";
  const n = Number(v);
  if (Number.isNaN(n)) return String(v);
  return String(n);
}

export function PaiesExportButtons({ q, total }: { q?: string; total: number }) {
  const [exporting, setExporting] = useState<"pdf" | "csv" | null>(null);
  const disabled = total === 0 || exporting !== null;

  async function loadItems() {
    const r = await exportRecords("paies", q);
    if (!r.ok) {
      alert(r.message);
      return null;
    }
    return r.items;
  }

  async function exportPdf() {
    setExporting("pdf");
    try {
      const items = await loadItems();
      if (!items) return;
      const { generatePaiesListPdf } = await import("@/lib/pdf");
      generatePaiesListPdf(items, q);
    } finally {
      setExporting(null);
    }
  }

  async function exportCsv() {
    setExporting("csv");
    try {
      const items = await loadItems();
      if (!items) return;
      downloadCsv(
        "paies.csv",
        ["Employé", "Matricule", "Mois", "Année", "Salaire net", "Primes", "Déductions", "Date paiement"],
        items.map((r: any) => {
          const moisNum = Number(r.mois);
          return [
            r.employe ? `${r.employe.prenom} ${r.employe.nom}` : "—",
            r.employe?.matricule ?? "—",
            MOIS[moisNum - 1] ?? String(r.mois ?? "—"),
            r.annee?.annee ?? "—",
            fmtMoney(r.salaireNet),
            fmtMoney(r.primes ?? 0),
            fmtMoney(r.deductions ?? 0),
            r.datePaiement ? String(r.datePaiement).slice(0, 10) : "—",
          ];
        }),
      );
    } finally {
      setExporting(null);
    }
  }

  return (
    <>
      <Button variant="secondary" className="gap-1.5" disabled={disabled} onClick={exportPdf}>
        <FileDown size={15} /> {exporting === "pdf" ? "Génération…" : "PDF"}
      </Button>
      <Button variant="secondary" className="gap-1.5" disabled={disabled} onClick={exportCsv}>
        <FileSpreadsheet size={15} /> {exporting === "csv" ? "Génération…" : "CSV"}
      </Button>
    </>
  );
}
