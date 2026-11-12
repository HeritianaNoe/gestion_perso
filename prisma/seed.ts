import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { existsSync, readFileSync } from "node:fs";

// Next.js lit .env.local en priorité sur .env ; on fait pareil pour viser la MÊME base que l'application
// (sinon le seed peut remplir une autre base que celle affichée, sans aucune erreur).
if (existsSync(".env.local")) {
  const m = readFileSync(".env.local", "utf8").match(/^\s*DATABASE_URL\s*=\s*(.+?)\s*$/m);
  if (m) process.env.DATABASE_URL = m[1].replace(/^["']|["']$/g, "");
}

const prisma = new PrismaClient();

const DEPARTEMENTS = [
  { nom: "Marketing", description: "Communication, publicité et études de marché" },
  { nom: "Comptabilité", description: "Comptabilité, finances et paie" },
  { nom: "Production", description: "Fabrication et contrôle qualité" },
  { nom: "Logistique", description: "Approvisionnement, stock et transport" },
  { nom: "Ressources Humaines", description: "Gestion du personnel et recrutement" },
  { nom: "Informatique", description: "Systèmes d'information et support technique" },
];

// departement: null => poste transversal (aucun département)
const POSTES: { intitule: string; min: number; max: number; departement: string | null }[] = [
  { intitule: "Directeur", min: 3_000_000, max: 6_000_000, departement: null },
  { intitule: "Secrétaire", min: 500_000, max: 900_000, departement: "Ressources Humaines" },
  { intitule: "Chauffeur", min: 400_000, max: 700_000, departement: "Logistique" },
  { intitule: "Informaticien", min: 900_000, max: 2_000_000, departement: "Informatique" },
  { intitule: "Comptable", min: 800_000, max: 1_800_000, departement: "Comptabilité" },
  { intitule: "Responsable RH", min: 1_000_000, max: 2_500_000, departement: "Ressources Humaines" },
  // Postes supplémentaires (Marketing et Production n'en avaient aucun)
  { intitule: "Responsable Marketing", min: 1_000_000, max: 2_500_000, departement: "Marketing" },
  { intitule: "Chargé de communication", min: 700_000, max: 1_500_000, departement: "Marketing" },
  { intitule: "Agent de production", min: 450_000, max: 800_000, departement: "Production" },
  { intitule: "Contrôleur qualité", min: 700_000, max: 1_400_000, departement: "Production" },
  { intitule: "Magasinier", min: 450_000, max: 800_000, departement: "Logistique" },
  { intitule: "Assistant comptable", min: 500_000, max: 900_000, departement: "Comptabilité" },
];

async function main() {
  try {
    const u = new URL(process.env.DATABASE_URL ?? "");
    console.log(`Base cible : ${u.hostname}:${u.port || 5432}${u.pathname}`);
  } catch {
    console.log("Base cible : DATABASE_URL introuvable ou invalide");
  }
  const employesAvant = await prisma.employe.count();
  console.log(`Avant : ${employesAvant} employés`);

  // Les données d'exemple (sanctions) ne sont créées QU'UNE SEULE FOIS.
  // Sans ce marqueur, relancer « npm run db:seed » recréerait ce que l'utilisateur a supprimé.
  const MARQUEUR = "seed_demo_v1";
  const dejaFait = await prisma.parametre.findUnique({ where: { cle: MARQUEUR } });
  const injecterDemo = !dejaFait && employesAvant === 0; // base déjà utilisée => on n'injecte rien


  // Utilisateur administrateur
  const passwordHash = await bcrypt.hash("password123", 12);
  await prisma.user.upsert({
    where: { email: "admin@entreprise.mg" },
    update: {},
    create: { email: "admin@entreprise.mg", passwordHash, role: "ADMIN" },
  });

  // Compte Directeur (MANAGER)
  const dirHash = await bcrypt.hash("password123", 12);
  await prisma.user.upsert({
    where: { email: "directeur@entreprise.mg" },
    update: {},
    create: { email: "directeur@entreprise.mg", passwordHash: dirHash, role: "MANAGER" },
  });

  // Compte Comptable (RH pour accès paie / lecture-écriture limitée)
  const comptHash = await bcrypt.hash("password123", 12);
  await prisma.user.upsert({
    where: { email: "comptable@entreprise.mg" },
    update: {},
    create: { email: "comptable@entreprise.mg", passwordHash: comptHash, role: "RH" },
  });

  // Année
  const annee = await prisma.annee.upsert({ where: { annee: 2026 }, update: {}, create: { annee: 2026 } });

  // Départements (6)
  const dept: Record<string, number> = {};
  for (const d of DEPARTEMENTS) {
    const row = await prisma.departement.upsert({ where: { nom: d.nom }, update: {}, create: d });
    dept[d.nom] = row.id;
  }

  // Postes (12)
  const poste: Record<string, number> = {};
  for (const p of POSTES) {
    const existing = await prisma.poste.findFirst({ where: { intitule: p.intitule } });
    const row =
      existing ??
      (await prisma.poste.create({
        data: {
          intitule: p.intitule,
          salaireBaseMin: p.min,
          salaireBaseMax: p.max,
          departementId: p.departement ? dept[p.departement] : null,
        },
      }));
    poste[p.intitule] = row.id;
  }

  // Employés d'exemple (20) : sans photo => avatar par défaut selon le sexe
  const d = (v: string) => new Date(v);
  const EMPLOYES: {
    matricule: string; nom: string; prenom: string; naissance: string; sexe: "M" | "F";
    email: string; tel: string; adresse: string; embauche: string;
    statut?: "ACTIF" | "EN_CONGE" | "LICENCIE" | "DEMISSIONNAIRE";
    poste: string;
    contrat: { type: "CDI" | "CDD" | "STAGE" | "PRESTATAIRE"; fin?: string; salaire: number };
    conge?: { type: "CONGE_PAYE" | "MALADIE" | "MATERNITE" | "SANS_SOLDE"; debut: string; fin: string; statut: "EN_ATTENTE" | "APPROUVE" | "REFUSE"; motif?: string };
  }[] = [
    { matricule: "EMP-0001", nom: "Rakoto", prenom: "Jean", naissance: "1990-05-12", sexe: "M", email: "jean.rakoto@entreprise.mg", tel: "0340000000", adresse: "Lot II A 12 Ankadifotsy, Antananarivo", embauche: "2024-01-02", poste: "Responsable RH",
      contrat: { type: "CDI", salaire: 1_200_000 },
      conge: { type: "CONGE_PAYE", debut: "2026-12-20", fin: "2026-12-27", statut: "EN_ATTENTE" } },
    { matricule: "EMP-0002", nom: "Rasoamanana", prenom: "Voahangy", naissance: "1984-03-21", sexe: "F", email: "voahangy.rasoamanana@entreprise.mg", tel: "0321100002", adresse: "Ivandry, Antananarivo", embauche: "2020-02-03", poste: "Directeur",
      contrat: { type: "CDI", salaire: 4_500_000 } },
    { matricule: "EMP-0003", nom: "Randria", prenom: "Mamy", naissance: "1992-09-30", sexe: "M", email: "mamy.randria@entreprise.mg", tel: "0331100003", adresse: "Ambohimanarina, Antananarivo", embauche: "2022-06-01", poste: "Informaticien",
      contrat: { type: "CDI", salaire: 1_500_000 } },
    { matricule: "EMP-0004", nom: "Rabe", prenom: "Fanja", naissance: "1991-11-08", sexe: "F", email: "fanja.rabe@entreprise.mg", tel: "0341100004", adresse: "Analakely, Antananarivo", embauche: "2021-09-15", poste: "Comptable",
      contrat: { type: "CDI", salaire: 1_100_000 },
      conge: { type: "CONGE_PAYE", debut: "2026-11-23", fin: "2026-12-04", statut: "APPROUVE" } },
    { matricule: "EMP-0005", nom: "Andrianina", prenom: "Tojo", naissance: "1985-07-19", sexe: "M", email: "tojo.andrianina@entreprise.mg", tel: "0381100005", adresse: "Anosibe, Antananarivo", embauche: "2023-03-10", poste: "Chauffeur",
      contrat: { type: "CDD", fin: "2027-03-09", salaire: 550_000 } },
    { matricule: "EMP-0006", nom: "Razafy", prenom: "Lalaina", naissance: "1995-01-25", sexe: "F", email: "lalaina.razafy@entreprise.mg", tel: "0321100006", adresse: "Ankorondrano, Antananarivo", embauche: "2023-08-01", statut: "EN_CONGE", poste: "Secrétaire",
      contrat: { type: "CDI", salaire: 650_000 },
      conge: { type: "MATERNITE", debut: "2026-10-15", fin: "2027-01-24", statut: "APPROUVE", motif: "Congé de maternité" } },
    { matricule: "EMP-0007", nom: "Ravelo", prenom: "Hery", naissance: "1994-04-14", sexe: "M", email: "hery.ravelo@entreprise.mg", tel: "0331100007", adresse: "Tanjombato, Antananarivo", embauche: "2025-02-17", poste: "Informaticien",
      contrat: { type: "CDD", fin: "2027-02-16", salaire: 1_000_000 },
      conge: { type: "MALADIE", debut: "2026-11-02", fin: "2026-11-06", statut: "APPROUVE", motif: "Certificat médical" } },
    { matricule: "EMP-0008", nom: "Rakotomalala", prenom: "Soa", naissance: "1999-12-02", sexe: "F", email: "soa.rakotomalala@entreprise.mg", tel: "0341100008", adresse: "Itaosy, Antananarivo", embauche: "2026-05-05", poste: "Comptable",
      contrat: { type: "STAGE", fin: "2027-05-04", salaire: 300_000 } },
    { matricule: "EMP-0009", nom: "Rasolofo", prenom: "Nirina", naissance: "1987-06-06", sexe: "M", email: "nirina.rasolofo@entreprise.mg", tel: "0381100009", adresse: "Ampefiloha, Antananarivo", embauche: "2019-10-01", statut: "DEMISSIONNAIRE", poste: "Chauffeur",
      contrat: { type: "CDI", salaire: 650_000 } },
    { matricule: "EMP-0010", nom: "Ramanana", prenom: "Mialy", naissance: "1997-08-17", sexe: "F", email: "mialy.ramanana@entreprise.mg", tel: "0321100010", adresse: "Andraharo, Antananarivo", embauche: "2026-01-12", poste: "Secrétaire",
      contrat: { type: "PRESTATAIRE", fin: "2026-12-31", salaire: 700_000 },
      conge: { type: "SANS_SOLDE", debut: "2026-12-14", fin: "2026-12-18", statut: "REFUSE", motif: "Raisons personnelles" } },

    // ── Employés supplémentaires ──
    { matricule: "EMP-0011", nom: "Rakotondrabe", prenom: "Hasina", naissance: "1988-02-11", sexe: "M", email: "hasina.rakotondrabe@entreprise.mg", tel: "0341100011", adresse: "Ambatonakanga, Antananarivo", embauche: "2021-03-01", poste: "Responsable Marketing",
      contrat: { type: "CDI", salaire: 1_800_000 } },
    { matricule: "EMP-0012", nom: "Andriamampianina", prenom: "Fara", naissance: "1993-06-28", sexe: "F", email: "fara.andriamampianina@entreprise.mg", tel: "0321100012", adresse: "Behoririka, Antananarivo", embauche: "2022-09-12", poste: "Chargé de communication",
      contrat: { type: "CDI", salaire: 1_000_000 },
      conge: { type: "CONGE_PAYE", debut: "2026-11-16", fin: "2026-11-20", statut: "APPROUVE" } },
    { matricule: "EMP-0013", nom: "Rajaonarison", prenom: "Tiana", naissance: "1996-10-03", sexe: "M", email: "tiana.rajaonarison@entreprise.mg", tel: "0331100013", adresse: "Ankadikely Ilafy, Antananarivo", embauche: "2024-04-08", poste: "Agent de production",
      contrat: { type: "CDD", fin: "2027-04-07", salaire: 520_000 } },
    { matricule: "EMP-0014", nom: "Razanamahefa", prenom: "Liva", naissance: "1990-01-19", sexe: "F", email: "liva.razanamahefa@entreprise.mg", tel: "0381100014", adresse: "Isotry, Antananarivo", embauche: "2020-11-02", poste: "Contrôleur qualité",
      contrat: { type: "CDI", salaire: 1_100_000 } },
    { matricule: "EMP-0015", nom: "Rasolonjatovo", prenom: "Fenitra", naissance: "1998-05-23", sexe: "M", email: "fenitra.rasolonjatovo@entreprise.mg", tel: "0341100015", adresse: "Ambohipo, Antananarivo", embauche: "2025-06-02", poste: "Magasinier",
      contrat: { type: "CDD", fin: "2027-06-01", salaire: 480_000 },
      conge: { type: "MALADIE", debut: "2026-10-26", fin: "2026-10-30", statut: "APPROUVE", motif: "Certificat médical" } },
    { matricule: "EMP-0016", nom: "Ravaoarisoa", prenom: "Hanta", naissance: "1992-09-09", sexe: "F", email: "hanta.ravaoarisoa@entreprise.mg", tel: "0321100016", adresse: "Mahamasina, Antananarivo", embauche: "2023-01-16", poste: "Assistant comptable",
      contrat: { type: "CDI", salaire: 650_000 } },
    { matricule: "EMP-0017", nom: "Randrianasolo", prenom: "Dina", naissance: "1986-12-14", sexe: "M", email: "dina.randrianasolo@entreprise.mg", tel: "0331100017", adresse: "Anosizato, Antananarivo", embauche: "2018-07-02", statut: "LICENCIE", poste: "Agent de production",
      contrat: { type: "CDI", salaire: 600_000 } },
    { matricule: "EMP-0018", nom: "Rafanomezana", prenom: "Mino", naissance: "2000-03-30", sexe: "F", email: "mino.rafanomezana@entreprise.mg", tel: "0341100018", adresse: "Ambohijatovo, Antananarivo", embauche: "2026-07-01", poste: "Chargé de communication",
      contrat: { type: "STAGE", fin: "2027-06-30", salaire: 300_000 } },
    { matricule: "EMP-0019", nom: "Andrianjafy", prenom: "Tahina", naissance: "1989-08-05", sexe: "M", email: "tahina.andrianjafy@entreprise.mg", tel: "0381100019", adresse: "Tsiadana, Antananarivo", embauche: "2022-02-14", poste: "Chauffeur",
      contrat: { type: "CDI", salaire: 600_000 },
      conge: { type: "SANS_SOLDE", debut: "2026-12-01", fin: "2026-12-05", statut: "EN_ATTENTE", motif: "Affaires familiales" } },
    { matricule: "EMP-0020", nom: "Rabemananjara", prenom: "Sitraka", naissance: "1994-11-27", sexe: "F", email: "sitraka.rabemananjara@entreprise.mg", tel: "0321100020", adresse: "Soanierana, Antananarivo", embauche: "2024-10-07", poste: "Secrétaire",
      contrat: { type: "CDI", salaire: 680_000 },
      conge: { type: "CONGE_PAYE", debut: "2026-12-22", fin: "2026-12-31", statut: "EN_ATTENTE" } },
  ];

  for (const e of EMPLOYES) {
    const emp = await prisma.employe.upsert({
      where: { matricule: e.matricule },
      update: {},
      create: {
        matricule: e.matricule,
        nom: e.nom,
        prenom: e.prenom,
        dateNaissance: d(e.naissance),
        sexe: e.sexe,
        email: e.email,
        telephone: e.tel,
        adresse: e.adresse,
        dateEmbauche: d(e.embauche),
        statut: e.statut ?? "ACTIF",
        posteId: poste[e.poste],
        // photo non renseignée : l'application affiche l'avatar par défaut
      },
    }).catch((err: unknown) => {
      console.warn(`⚠ Employé ${e.matricule} ignoré :`, String((err as Error).message).trim().split("\n").pop());
      return null;
    });
    if (!emp) continue;

    if ((await prisma.contrat.count({ where: { employeId: emp.id } })) === 0) {
      await prisma.contrat.create({
        data: {
          employeId: emp.id, typeContrat: e.contrat.type, dateDebut: d(e.embauche),
          dateFin: e.contrat.fin ? d(e.contrat.fin) : null, salaireActuel: e.contrat.salaire,
        },
      });
    }

    if (e.conge && (await prisma.conge.count({ where: { employeId: emp.id } })) === 0) {
      await prisma.conge.create({
        data: {
          employeId: emp.id, typeConge: e.conge.type, dateDebut: d(e.conge.debut), dateFin: d(e.conge.fin),
          statut: e.conge.statut, motif: e.conge.motif ?? null,
        },
      });
    }

    if (new Date(e.embauche) <= d("2026-10-01") && (await prisma.paie.count({ where: { employeId: emp.id } })) === 0) {
      await prisma.paie.create({
        data: {
          employeId: emp.id, mois: 10, anneeId: annee.id,
          salaireNet: Math.round(e.contrat.salaire * 0.92),
          primes: e.contrat.type === "CDI" ? 50_000 : 0,
          datePaiement: d("2026-10-30"),
        },
      });
    }
  }

  if (injecterDemo) {
    // Sanctions / Avertissements d'exemple
    const emps = await prisma.employe.findMany({ take: 3, orderBy: { id: "asc" } });
    if (emps.length >= 3) {
      await prisma.sanction.createMany({
        data: [
          {
            type: "AVERTISSEMENT_ORAL",
            date: new Date("2026-03-15"),
            motif: "Retards répétés",
            description: "Trois retards constatés en février 2026. Avertissement oral donné en entretien.",
            statut: "LEVE",
            employeId: emps[2].id,
          },
          {
            type: "AVERTISSEMENT_ECRIT",
            date: new Date("2026-06-10"),
            motif: "Non-respect des consignes de sécurité",
            description: "Port des EPI non respecté en zone de production.",
            statut: "ACTIF",
            employeId: emps[2].id,
          },
          {
            type: "BLAME",
            date: new Date("2026-09-02"),
            motif: "Comportement inapproprié envers un collègue",
            description: "Propos déplacés lors d'une réunion d'équipe. Blâme formalisé.",
            statut: "ACTIF",
            employeId: emps[1].id,
          },
        ],
      });
    }

    // ── Avertissements supplémentaires (6) ──
    const SANCTIONS_SUP: {
      matricule: string; type: "AVERTISSEMENT_ORAL" | "AVERTISSEMENT_ECRIT" | "BLAME" | "MISE_A_PIED" | "RETENUE_SALAIRE";
      date: string; motif: string; description: string; statut: "ACTIF" | "LEVE";
    }[] = [
      { matricule: "EMP-0013", type: "AVERTISSEMENT_ORAL", date: "2026-02-10", motif: "Retards répétés",
        description: "Quatre retards constatés en janvier 2026. Avertissement oral donné par le chef d'atelier.", statut: "LEVE" },
      { matricule: "EMP-0017", type: "AVERTISSEMENT_ECRIT", date: "2026-04-22", motif: "Absences injustifiées",
        description: "Deux journées d'absence sans justificatif ni information préalable.", statut: "ACTIF" },
      { matricule: "EMP-0017", type: "MISE_A_PIED", date: "2026-08-05", motif: "Abandon de poste",
        description: "Départ de la ligne de production sans autorisation pendant le service. Mise à pied de 3 jours.", statut: "ACTIF" },
      { matricule: "EMP-0015", type: "BLAME", date: "2026-09-14", motif: "Négligence dans la gestion du stock",
        description: "Écarts d'inventaire répétés sur les entrées de marchandises non enregistrées.", statut: "ACTIF" },
      { matricule: "EMP-0016", type: "RETENUE_SALAIRE", date: "2026-10-05", motif: "Écart de caisse non justifié",
        description: "Écart de caisse non signalé à la hiérarchie. Retenue appliquée sur le salaire d'octobre.", statut: "ACTIF" },
      { matricule: "EMP-0019", type: "AVERTISSEMENT_ECRIT", date: "2026-07-20", motif: "Usage non autorisé du véhicule de service",
        description: "Véhicule utilisé en dehors des missions planifiées. Situation régularisée.", statut: "LEVE" },
    ];

    for (const sa of SANCTIONS_SUP) {
      const emp = await prisma.employe.findUnique({ where: { matricule: sa.matricule } });
      if (!emp) continue;
      const exists = await prisma.sanction.findFirst({
        where: { employeId: emp.id, type: sa.type, date: d(sa.date), motif: sa.motif },
      });
      if (!exists) {
        await prisma.sanction.create({
          data: { employeId: emp.id, type: sa.type, date: d(sa.date), motif: sa.motif, description: sa.description, statut: sa.statut },
        });
      }
    }
  }
  if (!dejaFait) {
    await prisma.parametre.create({ data: { cle: MARQUEUR, valeur: new Date().toISOString() } });
  }

  const [nEmp, nPoste, nSanc] = await Promise.all([
    prisma.employe.count(), prisma.poste.count(), prisma.sanction.count(),
  ]);
  console.log(`Seed terminé — employés : ${nEmp}, postes : ${nPoste}, sanctions : ${nSanc}`);
}

main()
  .catch((err) => {
    console.error("Échec du seed :", err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
