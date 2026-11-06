import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

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
];

async function main() {
  // Utilisateur administrateur
  const passwordHash = await bcrypt.hash("Admin@12345", 12);
  await prisma.user.upsert({
    where: { email: "admin@entreprise.mg" },
    update: {},
    create: { email: "admin@entreprise.mg", passwordHash, role: "ADMIN" },
  });

  // Compte Directeur (MANAGER)
  const dirHash = await bcrypt.hash("Directeur@2026", 12);
  await prisma.user.upsert({
    where: { email: "directeur@entreprise.mg" },
    update: {},
    create: { email: "directeur@entreprise.mg", passwordHash: dirHash, role: "MANAGER" },
  });

  // Compte Comptable (RH pour accès paie / lecture-écriture limitée)
  const comptHash = await bcrypt.hash("Comptable@2026", 12);
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

  // Postes (6)
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

  // Employés d'exemple (10) : sans photo => avatar par défaut selon le sexe
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
    });

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

  // Annonces d'exemple
  if ((await prisma.annonce.count()) === 0) {
    const firstEmp = await prisma.employe.findFirst({ orderBy: { id: "asc" } });
    await prisma.annonce.createMany({
      data: [
        {
          titre: "Réunion générale du personnel",
          contenu: "Une réunion générale aura lieu le 15 novembre 2026 à 10h dans la salle de conférence. Présence obligatoire.",
          statut: "PUBLIE",
          dateDebut: d("2026-11-01"),
          dateFin: d("2026-11-15"),
          auteurId: firstEmp?.id ?? null,
        },
        {
          titre: "Nouvelle politique de télétravail",
          contenu: "À partir de janvier 2027, le télétravail sera autorisé 2 jours par semaine sous réserve d'accord du manager.",
          statut: "PUBLIE",
          dateDebut: d("2026-11-01"),
          auteurId: firstEmp?.id ?? null,
        },
        {
          titre: "Brouillon : planning des congés 2027",
          contenu: "Document en cours de rédaction.",
          statut: "BROUILLON",
          auteurId: firstEmp?.id ?? null,
        },
      ],
    });
  }

  // Réclamations d'exemple
  if ((await prisma.reclamation.count()) === 0) {
    const emps = await prisma.employe.findMany({ take: 3, orderBy: { id: "asc" } });
    if (emps.length >= 2) {
      await prisma.reclamation.createMany({
        data: [
          {
            sujet: "Problème de climatisation au bureau",
            description: "La climatisation du bureau 3 ne fonctionne plus depuis 3 jours.",
            statut: "OUVERTE",
            priorite: "HAUTE",
            employeId: emps[0].id,
          },
          {
            sujet: "Demande de matériel informatique",
            description: "Mon ordinateur portable est trop lent pour les tâches quotidiennes. Demande de renouvellement.",
            statut: "EN_COURS",
            priorite: "MOYENNE",
            employeId: emps[1].id,
          },
          {
            sujet: "Erreur sur le bulletin de paie",
            description: "Les primes du mois d'octobre n'apparaissent pas sur mon bulletin.",
            statut: "RESOLUE",
            priorite: "HAUTE",
            employeId: emps[0].id,
            resolvedAt: new Date(),
          },
        ],
      });
    }

    // Sanctions / Avertissements d'exemple
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
  }
}

main().finally(() => prisma.$disconnect());
