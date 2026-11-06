import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

type Row = Record<string, any>;

function fmtDate(v: any): string {
  if (!v) return "—";
  const d = typeof v === "string" ? new Date(v) : v;
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

function fmtMoney(v: any): string {
  if (v == null || v === "") return "—";
  const n = Number(v);
  if (Number.isNaN(n)) return String(v);
  return new Intl.NumberFormat("fr-MG", { style: "currency", currency: "MGA", maximumFractionDigits: 0 }).format(n);
}

function header(doc: jsPDF, title: string) {
  doc.setFillColor(67, 56, 202); // indigo-600
  doc.rect(0, 0, 210, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Gestion RH — Entreprise", 14, 12);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(title, 14, 20);
  doc.setTextColor(30, 41, 59);
}

function footer(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Généré le ${new Date().toLocaleString("fr-FR")} — Page ${i}/${pageCount}`,
      105,
      290,
      { align: "center" },
    );
  }
}

function sectionTitle(doc: jsPDF, y: number, text: string): number {
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(67, 56, 202);
  doc.text(text, 14, y);
  doc.setDrawColor(199, 210, 254);
  doc.setLineWidth(0.4);
  doc.line(14, y + 1.5, 196, y + 1.5);
  return y + 8;
}

function kv(doc: jsPDF, y: number, label: string, value: string, xLabel = 14, xValue = 70): number {
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(label, xLabel, y);
  doc.setTextColor(30, 41, 59);
  doc.setFont("helvetica", "bold");
  const lines = doc.splitTextToSize(String(value ?? "—"), 120);
  doc.text(lines, xValue, y);
  return y + Math.max(6, lines.length * 4.5);
}

export function generateEmployePdf(row: Row, relations?: Record<string, { value: string; label: string }[]>) {
  const doc = new jsPDF();
  header(doc, "Fiche employé");

  let y = 38;
  y = sectionTitle(doc, y, "Identité");

  const nomComplet = `${row.prenom ?? ""} ${row.nom ?? ""}`.trim();
  y = kv(doc, y, "Nom complet", nomComplet || "—");
  y = kv(doc, y, "Matricule", row.matricule ?? "—");
  y = kv(doc, y, "Email", row.email ?? "—");
  y = kv(doc, y, "Téléphone", row.telephone ?? "—");
  y = kv(doc, y, "Sexe", row.sexe === "M" ? "Masculin" : row.sexe === "F" ? "Féminin" : "—");
  y = kv(doc, y, "Date de naissance", fmtDate(row.dateNaissance));
  y = kv(doc, y, "Adresse", row.adresse ?? "—");

  y += 4;
  y = sectionTitle(doc, y, "Situation professionnelle");
  const posteLabel =
    relations?.postes?.find((o) => o.value === String(row.posteId))?.label ??
    (row.poste?.intitule ?? "—");
  y = kv(doc, y, "Poste", posteLabel);
  y = kv(doc, y, "Statut", String(row.statut ?? "—").replace(/_/g, " "));
  y = kv(doc, y, "Date d'embauche", fmtDate(row.dateEmbauche));

  footer(doc);
  doc.save(`employe-${row.matricule || row.id}.pdf`);
}

export function generateContratPdf(row: Row, relations?: Record<string, { value: string; label: string }[]>) {
  const doc = new jsPDF();
  header(doc, "Détail du contrat");

  let y = 38;
  y = sectionTitle(doc, y, "Employé");
  const empLabel =
    relations?.employes?.find((o) => o.value === String(row.employeId))?.label ??
    (row.employe ? `${row.employe.nom} ${row.employe.prenom} (${row.employe.matricule})` : "—");
  y = kv(doc, y, "Employé", empLabel);

  y += 4;
  y = sectionTitle(doc, y, "Contrat");
  y = kv(doc, y, "Type de contrat", String(row.typeContrat ?? "—"));
  y = kv(doc, y, "Date de début", fmtDate(row.dateDebut));
  y = kv(doc, y, "Date de fin", row.dateFin ? fmtDate(row.dateFin) : "Indéterminée (CDI)");
  y = kv(doc, y, "Salaire actuel", fmtMoney(row.salaireActuel));

  footer(doc);
  doc.save(`contrat-${row.id}.pdf`);
}

export function generateCongePdf(row: Row, relations?: Record<string, { value: string; label: string }[]>) {
  const doc = new jsPDF();
  header(doc, "Fiche de congé");

  let y = 38;
  y = sectionTitle(doc, y, "Employé");
  const empLabel =
    relations?.employes?.find((o) => o.value === String(row.employeId))?.label ??
    (row.employe ? `${row.employe.nom} ${row.employe.prenom} (${row.employe.matricule})` : "—");
  y = kv(doc, y, "Employé", empLabel);

  y += 4;
  y = sectionTitle(doc, y, "Congé / Absence");
  const typeMap: Record<string, string> = {
    CONGE_PAYE: "Congé payé",
    MALADIE: "Maladie",
    MATERNITE: "Maternité",
    SANS_SOLDE: "Sans solde",
  };
  const statutMap: Record<string, string> = {
    EN_ATTENTE: "En attente",
    APPROUVE: "Approuvé",
    REFUSE: "Refusé",
  };
  y = kv(doc, y, "Type de congé", typeMap[row.typeConge] ?? String(row.typeConge ?? "—"));
  y = kv(doc, y, "Date de début", fmtDate(row.dateDebut));
  y = kv(doc, y, "Date de fin", fmtDate(row.dateFin));
  y = kv(doc, y, "Statut", statutMap[row.statut] ?? String(row.statut ?? "—"));
  if (row.motif) {
    y = kv(doc, y, "Motif", row.motif);
  }

  // Signature box
  y += 12;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.rect(14, y, 80, 28);
  doc.rect(110, y, 80, 28);
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("Signature de l'employé", 16, y + 6);
  doc.text("Visa RH / Direction", 112, y + 6);

  footer(doc);
  doc.save(`conge-${row.id}.pdf`);
}

export function generateSanctionPdf(row: Row, relations?: Record<string, { value: string; label: string }[]>) {
  const doc = new jsPDF();
  header(doc, "Fiche de sanction / avertissement");

  let y = 38;
  y = sectionTitle(doc, y, "Employé");
  const empLabel =
    relations?.employes?.find((o) => o.value === String(row.employeId))?.label ??
    (row.employe ? `${row.employe.nom} ${row.employe.prenom} (${row.employe.matricule})` : "—");
  y = kv(doc, y, "Employé", empLabel);

  y += 4;
  y = sectionTitle(doc, y, "Sanction");
  const typeMap: Record<string, string> = {
    AVERTISSEMENT_ORAL: "Avertissement oral",
    AVERTISSEMENT_ECRIT: "Avertissement écrit",
    BLAME: "Blâme",
    MISE_A_PIED: "Mise à pied",
    RETENUE_SALAIRE: "Retenue sur salaire",
  };
  y = kv(doc, y, "Type", typeMap[row.type] ?? String(row.type ?? "—"));
  y = kv(doc, y, "Date", fmtDate(row.date));
  y = kv(doc, y, "Motif", row.motif ?? "—");
  y = kv(doc, y, "Statut", row.statut === "LEVE" ? "Levé" : "Actif");
  if (row.description) {
    y = kv(doc, y, "Description", row.description);
  }

  footer(doc);
  doc.save(`sanction-${row.id}.pdf`);
}
