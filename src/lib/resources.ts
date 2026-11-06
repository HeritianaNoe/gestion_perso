import type { FieldDef, IconName, Opt } from "@/components/crud/types";

export type ResourceKey =
  | "annees" | "departements" | "postes" | "employes" | "contrats" | "conges" | "paies"
  | "annonces" | "reclamations" | "sanctions";

export type Resource = {
  key: ResourceKey;
  model: "annee" | "departement" | "poste" | "employe" | "contrat" | "conge" | "paie" | "annonce" | "reclamation" | "sanction";
  singular: string;
  plural: string;
  icon: IconName;
  fields: FieldDef[];
  search: string[];
  orderBy: object;
  optionLabel: (row: any) => string;
  validate?: (d: Record<string, any>) => Record<string, string>;
  deleteWarning?: string;
  /** Include related models when listing (for photo next to name, etc.) */
  include?: object;
};

// ───── Options des enums ─────
const SEXE: Opt[] = [
  { value: "M", label: "Masculin" },
  { value: "F", label: "Féminin" },
];
const STATUT_EMPLOYE: Opt[] = [
  { value: "ACTIF", label: "Actif" },
  { value: "EN_CONGE", label: "En congé" },
  { value: "LICENCIE", label: "Licencié" },
  { value: "DEMISSIONNAIRE", label: "Démissionnaire" },
];
const TYPE_CONTRAT: Opt[] = [
  { value: "CDI", label: "CDI" },
  { value: "CDD", label: "CDD" },
  { value: "STAGE", label: "Stage" },
  { value: "PRESTATAIRE", label: "Prestataire" },
];
const TYPE_CONGE: Opt[] = [
  { value: "CONGE_PAYE", label: "Congé payé" },
  { value: "MALADIE", label: "Maladie" },
  { value: "MATERNITE", label: "Maternité" },
  { value: "SANS_SOLDE", label: "Sans solde" },
];
const STATUT_CONGE: Opt[] = [
  { value: "EN_ATTENTE", label: "En attente" },
  { value: "APPROUVE", label: "Approuvé" },
  { value: "REFUSE", label: "Refusé" },
];
const STATUT_ANNEE: Opt[] = [
  { value: "OUVERT", label: "Ouvert" },
  { value: "FERME", label: "Fermé" },
];
const STATUT_ANNONCE: Opt[] = [
  { value: "BROUILLON", label: "Brouillon" },
  { value: "PUBLIE", label: "Publié" },
  { value: "ARCHIVE", label: "Archivé" },
];
const STATUT_RECLAMATION: Opt[] = [
  { value: "OUVERTE", label: "Ouverte" },
  { value: "EN_COURS", label: "En cours" },
  { value: "RESOLUE", label: "Résolue" },
  { value: "FERMEE", label: "Fermée" },
];
const PRIORITE_RECLAMATION: Opt[] = [
  { value: "BASSE", label: "Basse" },
  { value: "MOYENNE", label: "Moyenne" },
  { value: "HAUTE", label: "Haute" },
];
const TYPE_SANCTION: Opt[] = [
  { value: "AVERTISSEMENT_ORAL", label: "Avertissement oral" },
  { value: "AVERTISSEMENT_ECRIT", label: "Avertissement écrit" },
  { value: "BLAME", label: "Blâme" },
  { value: "MISE_A_PIED", label: "Mise à pied" },
  { value: "RETENUE_SALAIRE", label: "Retenue sur salaire" },
];
const STATUT_SANCTION: Opt[] = [
  { value: "ACTIF", label: "Actif" },
  { value: "LEVE", label: "Levé" },
];

const employeLabel = (e: any) => `${e.nom} ${e.prenom} (${e.matricule})`;
const SEARCH_EMPLOYE = ["employe.nom", "employe.prenom", "employe.matricule"];
const INCLUDE_EMPLOYE = { employe: true };

export const RESOURCES: Record<ResourceKey, Resource> = {
  annees: {
    key: "annees", model: "annee", singular: "Année", plural: "Années", icon: "calendar",
    fields: [
      { name: "annee", icon: "calendar", label: "Année", type: "int", required: true, list: true, min: 1900, max: 2200 },
      { name: "statut", icon: "activity", label: "Statut", type: "enum", required: true, list: true, options: STATUT_ANNEE, defaultValue: "OUVERT" },
    ],
    search: ["annee"],
    orderBy: { annee: "desc" },
    optionLabel: (r) => String(r.annee),
    deleteWarning: "Une année ne peut pas être supprimée tant que des paies y sont rattachées.",
  },

  departements: {
    key: "departements", model: "departement", singular: "Département", plural: "Départements", icon: "building",
    fields: [
      { name: "nom", icon: "building", label: "Nom", type: "text", required: true, list: true, maxLength: 100 },
      { name: "description", icon: "text", label: "Description", type: "textarea", list: true },
    ],
    search: ["nom", "description"],
    orderBy: { nom: "asc" },
    optionLabel: (r) => r.nom,
  },

  postes: {
    key: "postes", model: "poste", singular: "Poste", plural: "Postes", icon: "briefcase",
    fields: [
      { name: "intitule", icon: "briefcase", label: "Intitulé", type: "text", required: true, list: true, maxLength: 100 },
      { name: "departementId", icon: "building", label: "Département", type: "relation", relation: "departements", list: true },
      { name: "salaireBaseMin", icon: "banknote", label: "Salaire base min", type: "decimal", required: true, list: true, unit: "Ar" },
      { name: "salaireBaseMax", icon: "banknote", label: "Salaire base max", type: "decimal", required: true, list: true, unit: "Ar" },
    ],
    search: ["intitule"],
    orderBy: { intitule: "asc" },
    optionLabel: (r) => r.intitule,
    validate: (d): Record<string, string> =>
      d.salaireBaseMin != null && d.salaireBaseMax != null && d.salaireBaseMin > d.salaireBaseMax
        ? { salaireBaseMax: "Doit être supérieur ou égal au salaire minimum" }
        : {},
  },

  employes: {
    key: "employes", model: "employe", singular: "Employé", plural: "Employés", icon: "users",
    fields: [
      // photo not listed separately — shown next to name
      { name: "photo", icon: "image", label: "Photo", type: "image" },
      { name: "nom", icon: "user", label: "Nom & Prénom", type: "text", required: true, list: true, maxLength: 50 },
      { name: "prenom", icon: "user", label: "Prénom", type: "text", required: true, maxLength: 50 },
      { name: "matricule", icon: "idcard", label: "Matricule", type: "text", required: true, list: true, maxLength: 20 },
      { name: "posteId", icon: "briefcase", label: "Poste", type: "relation", relation: "postes", list: true },
      { name: "statut", icon: "activity", label: "Statut", type: "enum", required: true, list: true, options: STATUT_EMPLOYE, defaultValue: "ACTIF" },
      { name: "email", icon: "mail", label: "Email", type: "email", required: true, maxLength: 100 },
      { name: "telephone", icon: "phone", label: "Téléphone", type: "tel", maxLength: 20 },
      { name: "dateNaissance", icon: "cake", label: "Date de naissance", type: "date", required: true },
      { name: "sexe", icon: "gender", label: "Sexe", type: "enum", required: true, options: SEXE },
      { name: "adresse", icon: "pin", label: "Adresse", type: "textarea" },
      { name: "dateEmbauche", icon: "calendarPlus", label: "Date d'embauche", type: "date", required: true },
    ],
    search: ["matricule", "nom", "prenom", "email"],
    orderBy: [{ nom: "asc" }, { prenom: "asc" }],
    optionLabel: employeLabel,
    deleteWarning: "Les contrats, congés, paies et sanctions de cet employé seront également supprimés.",
  },

  contrats: {
    key: "contrats", model: "contrat", singular: "Contrat", plural: "Contrats", icon: "file",
    fields: [
      { name: "employeId", icon: "user", label: "Employé", type: "relation", relation: "employes", required: true, list: true },
      { name: "typeContrat", icon: "file", label: "Type de contrat", type: "enum", required: true, list: true, options: TYPE_CONTRAT },
      { name: "dateDebut", icon: "calendarPlus", label: "Date début", type: "date", required: true, list: true },
      { name: "dateFin", icon: "calendarCheck", label: "Date fin", type: "date", list: true },
      { name: "salaireActuel", icon: "banknote", label: "Salaire actuel", type: "decimal", required: true, list: true, unit: "Ar" },
    ],
    search: SEARCH_EMPLOYE,
    orderBy: { dateDebut: "desc" },
    optionLabel: (r) => `Contrat #${r.id}`,
    include: INCLUDE_EMPLOYE,
    validate: (d): Record<string, string> =>
      d.dateFin && d.dateFin < d.dateDebut ? { dateFin: "La date de fin doit être postérieure à la date de début" } : {},
  },

  conges: {
    key: "conges", model: "conge", singular: "Congé", plural: "Congés et absences", icon: "palm",
    fields: [
      { name: "employeId", icon: "user", label: "Employé", type: "relation", relation: "employes", required: true, list: true },
      { name: "typeConge", icon: "palm", label: "Type de congé", type: "enum", required: true, list: true, options: TYPE_CONGE },
      { name: "dateDebut", icon: "calendarPlus", label: "Date début", type: "date", required: true, list: true },
      { name: "dateFin", icon: "calendarCheck", label: "Date fin", type: "date", required: true, list: true },
      { name: "statut", icon: "activity", label: "Statut", type: "enum", required: true, list: true, options: STATUT_CONGE, defaultValue: "EN_ATTENTE" },
      { name: "motif", icon: "message", label: "Motif", type: "textarea" },
    ],
    search: SEARCH_EMPLOYE,
    orderBy: { dateDebut: "desc" },
    optionLabel: (r) => `Congé #${r.id}`,
    include: INCLUDE_EMPLOYE,
    validate: (d): Record<string, string> =>
      d.dateFin && d.dateDebut && d.dateFin < d.dateDebut ? { dateFin: "La date de fin doit être postérieure à la date de début" } : {},
  },

  paies: {
    key: "paies", model: "paie", singular: "Paie", plural: "Paies", icon: "wallet",
    fields: [
      { name: "employeId", icon: "user", label: "Employé", type: "relation", relation: "employes", required: true, list: true },
      { name: "mois", icon: "calendarRange", label: "Mois (1-12)", type: "int", required: true, list: true, min: 1, max: 12 },
      { name: "anneeId", icon: "calendar", label: "Année", type: "relation", relation: "annees", required: true, list: true },
      { name: "salaireNet", icon: "wallet", label: "Salaire net", type: "decimal", required: true, list: true, unit: "Ar" },
      { name: "primes", icon: "gift", label: "Primes", type: "decimal", defaultValue: "0", unit: "Ar" },
      { name: "deductions", icon: "minus", label: "Déductions", type: "decimal", defaultValue: "0", unit: "Ar" },
      { name: "datePaiement", icon: "calendarCheck", label: "Date de paiement", type: "date", required: true, list: true },
    ],
    search: SEARCH_EMPLOYE,
    orderBy: { datePaiement: "desc" },
    optionLabel: (r) => `Paie #${r.id}`,
    include: INCLUDE_EMPLOYE,
  },

  annonces: {
    key: "annonces", model: "annonce", singular: "Annonce", plural: "Annonces", icon: "megaphone",
    fields: [
      { name: "titre", icon: "text", label: "Titre", type: "text", required: true, list: true, maxLength: 200 },
      { name: "contenu", icon: "message", label: "Contenu", type: "textarea", required: true },
      { name: "statut", icon: "activity", label: "Statut", type: "enum", required: true, list: true, options: STATUT_ANNONCE, defaultValue: "BROUILLON" },
      { name: "auteurId", icon: "user", label: "Auteur", type: "relation", relation: "employes", list: true },
      { name: "dateDebut", icon: "calendarPlus", label: "Date début", type: "date", list: true },
      { name: "dateFin", icon: "calendarCheck", label: "Date fin", type: "date", list: true },
    ],
    search: ["titre", "contenu"],
    orderBy: { createdAt: "desc" },
    optionLabel: (r) => r.titre,
    include: { auteur: true },
  },

  reclamations: {
    key: "reclamations", model: "reclamation", singular: "Réclamation", plural: "Réclamations", icon: "alert",
    fields: [
      { name: "sujet", icon: "text", label: "Sujet", type: "text", required: true, list: true, maxLength: 200 },
      { name: "description", icon: "message", label: "Description", type: "textarea", required: true },
      { name: "employeId", icon: "user", label: "Employé", type: "relation", relation: "employes", required: true, list: true },
      { name: "priorite", icon: "activity", label: "Priorité", type: "enum", required: true, list: true, options: PRIORITE_RECLAMATION, defaultValue: "MOYENNE" },
      { name: "statut", icon: "activity", label: "Statut", type: "enum", required: true, list: true, options: STATUT_RECLAMATION, defaultValue: "OUVERTE" },
    ],
    search: ["sujet", "description", "employe.nom", "employe.prenom"],
    orderBy: { createdAt: "desc" },
    optionLabel: (r) => r.sujet,
    include: INCLUDE_EMPLOYE,
  },

  sanctions: {
    key: "sanctions", model: "sanction", singular: "Sanction", plural: "Sanctions & Avertissements", icon: "alert",
    fields: [
      { name: "employeId", icon: "user", label: "Employé", type: "relation", relation: "employes", required: true, list: true },
      { name: "type", icon: "alert", label: "Type", type: "enum", required: true, list: true, options: TYPE_SANCTION },
      { name: "date", icon: "calendar", label: "Date", type: "date", required: true, list: true },
      { name: "motif", icon: "text", label: "Motif", type: "text", required: true, list: true, maxLength: 300 },
      { name: "description", icon: "message", label: "Description / Détails", type: "textarea" },
      { name: "statut", icon: "activity", label: "Statut", type: "enum", required: true, list: true, options: STATUT_SANCTION, defaultValue: "ACTIF" },
    ],
    search: ["motif", "description", ...SEARCH_EMPLOYE],
    orderBy: { date: "desc" },
    optionLabel: (r) => `Sanction #${r.id}`,
    include: INCLUDE_EMPLOYE,
  },
};

export const RESOURCE_LIST = Object.values(RESOURCES);

export function getResource(key: string): Resource | undefined {
  return Object.prototype.hasOwnProperty.call(RESOURCES, key) ? RESOURCES[key as ResourceKey] : undefined;
}

/** Groupes pour le menu sidebar */
export type NavGroup = { label: string; keys: ResourceKey[] };

export const NAV_GROUPS: NavGroup[] = [
  { label: "Organisation", keys: ["departements", "postes", "employes"] },
  { label: "Contrats & Paie", keys: ["contrats", "paies", "annees"] },
  { label: "Absences", keys: ["conges"] },
  { label: "Discipline", keys: ["sanctions"] },
  { label: "Communication", keys: ["annonces", "reclamations"] },
];
