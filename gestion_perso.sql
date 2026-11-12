--
-- PostgreSQL database dump
--

\restrict eSy0H7w53TLIGQF2rLSauafmpv59vfMSa0RMn9jHfkdh3YtKdERd4zBm0Mkeyn8

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: Role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Role" AS ENUM (
    'ADMIN',
    'RH',
    'MANAGER',
    'EMPLOYE'
);


ALTER TYPE public."Role" OWNER TO postgres;

--
-- Name: sexe_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.sexe_type AS ENUM (
    'M',
    'F'
);


ALTER TYPE public.sexe_type OWNER TO postgres;

--
-- Name: statut_annee_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.statut_annee_enum AS ENUM (
    'Ouvert',
    'Fermé'
);


ALTER TYPE public.statut_annee_enum OWNER TO postgres;

--
-- Name: statut_conge_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.statut_conge_enum AS ENUM (
    'En attente',
    'Approuvé',
    'Refusé'
);


ALTER TYPE public.statut_conge_enum OWNER TO postgres;

--
-- Name: statut_employe; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.statut_employe AS ENUM (
    'Actif',
    'En congé',
    'Licencié',
    'Démissionnaire'
);


ALTER TYPE public.statut_employe OWNER TO postgres;

--
-- Name: statut_sanction_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.statut_sanction_enum AS ENUM (
    'Actif',
    'Levé'
);


ALTER TYPE public.statut_sanction_enum OWNER TO postgres;

--
-- Name: type_conge_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.type_conge_enum AS ENUM (
    'Congé payé',
    'Maladie',
    'Maternité',
    'Sans solde'
);


ALTER TYPE public.type_conge_enum OWNER TO postgres;

--
-- Name: type_contrat_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.type_contrat_enum AS ENUM (
    'CDI',
    'CDD',
    'Stage',
    'Prestataire'
);


ALTER TYPE public.type_contrat_enum OWNER TO postgres;

--
-- Name: type_sanction_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.type_sanction_enum AS ENUM (
    'Avertissement oral',
    'Avertissement écrit',
    'Blâme',
    'Mise à pied',
    'Retenue sur salaire'
);


ALTER TYPE public.type_sanction_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    "passwordHash" text NOT NULL,
    role public."Role" DEFAULT 'EMPLOYE'::public."Role" NOT NULL,
    active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: annee; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.annee (
    id integer NOT NULL,
    annee integer NOT NULL,
    statut public.statut_annee_enum DEFAULT 'Ouvert'::public.statut_annee_enum NOT NULL,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.annee OWNER TO postgres;

--
-- Name: annee_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.annee_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.annee_id_seq OWNER TO postgres;

--
-- Name: annee_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.annee_id_seq OWNED BY public.annee.id;


--
-- Name: conge; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.conge (
    id integer NOT NULL,
    type_conge public.type_conge_enum NOT NULL,
    date_debut date NOT NULL,
    date_fin date NOT NULL,
    statut public.statut_conge_enum DEFAULT 'En attente'::public.statut_conge_enum NOT NULL,
    motif text,
    employe_id integer NOT NULL
);


ALTER TABLE public.conge OWNER TO postgres;

--
-- Name: conge_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.conge_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.conge_id_seq OWNER TO postgres;

--
-- Name: conge_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.conge_id_seq OWNED BY public.conge.id;


--
-- Name: contrat; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contrat (
    id integer NOT NULL,
    type_contrat public.type_contrat_enum NOT NULL,
    date_debut date NOT NULL,
    date_fin date,
    salaire_actuel numeric(10,2) NOT NULL,
    employe_id integer NOT NULL
);


ALTER TABLE public.contrat OWNER TO postgres;

--
-- Name: contrat_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.contrat_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.contrat_id_seq OWNER TO postgres;

--
-- Name: contrat_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.contrat_id_seq OWNED BY public.contrat.id;


--
-- Name: departement; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.departement (
    id integer NOT NULL,
    nom character varying(100) NOT NULL,
    description text,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.departement OWNER TO postgres;

--
-- Name: departement_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.departement_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.departement_id_seq OWNER TO postgres;

--
-- Name: departement_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.departement_id_seq OWNED BY public.departement.id;


--
-- Name: employe; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employe (
    id integer NOT NULL,
    matricule character varying(20) NOT NULL,
    nom character varying(50) NOT NULL,
    prenom character varying(50) NOT NULL,
    date_naissance date NOT NULL,
    sexe public.sexe_type NOT NULL,
    email character varying(100) NOT NULL,
    telephone character varying(20),
    adresse text,
    photo character varying(255),
    date_embauche date NOT NULL,
    statut public.statut_employe DEFAULT 'Actif'::public.statut_employe NOT NULL,
    poste_id integer,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.employe OWNER TO postgres;

--
-- Name: employe_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.employe_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.employe_id_seq OWNER TO postgres;

--
-- Name: employe_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.employe_id_seq OWNED BY public.employe.id;


--
-- Name: paie; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.paie (
    id integer NOT NULL,
    mois integer NOT NULL,
    annee_id integer NOT NULL,
    salaire_net numeric(10,2) NOT NULL,
    primes numeric(10,2) DEFAULT 0.00,
    deductions numeric(10,2) DEFAULT 0.00,
    date_paiement date NOT NULL,
    employe_id integer NOT NULL
);


ALTER TABLE public.paie OWNER TO postgres;

--
-- Name: paie_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.paie_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.paie_id_seq OWNER TO postgres;

--
-- Name: paie_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.paie_id_seq OWNED BY public.paie.id;


--
-- Name: parametre; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.parametre (
    cle character varying(50) NOT NULL,
    valeur text NOT NULL
);


ALTER TABLE public.parametre OWNER TO postgres;

--
-- Name: poste; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.poste (
    id integer NOT NULL,
    intitule character varying(100) NOT NULL,
    salaire_base_min numeric(10,2) NOT NULL,
    salaire_base_max numeric(10,2) NOT NULL,
    departement_id integer
);


ALTER TABLE public.poste OWNER TO postgres;

--
-- Name: poste_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.poste_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.poste_id_seq OWNER TO postgres;

--
-- Name: poste_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.poste_id_seq OWNED BY public.poste.id;


--
-- Name: sanction; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sanction (
    id integer NOT NULL,
    type public.type_sanction_enum NOT NULL,
    date date NOT NULL,
    motif character varying(300) NOT NULL,
    description text,
    statut public.statut_sanction_enum DEFAULT 'Actif'::public.statut_sanction_enum NOT NULL,
    employe_id integer NOT NULL,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.sanction OWNER TO postgres;

--
-- Name: sanction_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sanction_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sanction_id_seq OWNER TO postgres;

--
-- Name: sanction_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sanction_id_seq OWNED BY public.sanction.id;


--
-- Name: annee id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.annee ALTER COLUMN id SET DEFAULT nextval('public.annee_id_seq'::regclass);


--
-- Name: conge id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conge ALTER COLUMN id SET DEFAULT nextval('public.conge_id_seq'::regclass);


--
-- Name: contrat id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contrat ALTER COLUMN id SET DEFAULT nextval('public.contrat_id_seq'::regclass);


--
-- Name: departement id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departement ALTER COLUMN id SET DEFAULT nextval('public.departement_id_seq'::regclass);


--
-- Name: employe id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employe ALTER COLUMN id SET DEFAULT nextval('public.employe_id_seq'::regclass);


--
-- Name: paie id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.paie ALTER COLUMN id SET DEFAULT nextval('public.paie_id_seq'::regclass);


--
-- Name: poste id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.poste ALTER COLUMN id SET DEFAULT nextval('public.poste_id_seq'::regclass);


--
-- Name: sanction id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sanction ALTER COLUMN id SET DEFAULT nextval('public.sanction_id_seq'::regclass);


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, email, "passwordHash", role, active, "createdAt", "updatedAt") FROM stdin;
cmw5yf4gn0000qqjwr5x51oqi	admin@entreprise.mg	$2a$12$1WOSYcHAYAcG294Ih5dI/O6rIZguA.fOfjY6hYDzi248o5Dc3F0rq	ADMIN	t	2026-11-07 05:19:48.312	2026-11-07 05:19:48.312
cmw5yf4vp0001qqjw2z179d1w	directeur@entreprise.mg	$2a$12$geEpPagxPq.B9vQnKfy9tOpamQvMZ5EPd/iYCNoNd5.JSdMxdW5bi	MANAGER	t	2026-11-07 05:19:48.854	2026-11-07 05:19:48.854
cmw5yf5en0002qqjw1go1bmul	comptable@entreprise.mg	$2a$12$5rV7vC/4ERBgZxyBq0W5Uu6PEPAlbTleyjRGmh3INfjeUTNvdXmja	RH	t	2026-11-07 05:19:49.536	2026-11-07 05:19:49.536
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
\.


--
-- Data for Name: annee; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.annee (id, annee, statut, created_at) FROM stdin;
1	2026	Ouvert	2026-11-07 05:19:49.542
\.


--
-- Data for Name: conge; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.conge (id, type_conge, date_debut, date_fin, statut, motif, employe_id) FROM stdin;
1	Congé payé	2026-12-20	2026-12-27	En attente	\N	1
2	Congé payé	2026-11-23	2026-12-04	Approuvé	\N	4
3	Maternité	2026-10-15	2027-01-24	Approuvé	Congé de maternité	6
4	Maladie	2026-11-02	2026-11-06	Approuvé	Certificat médical	7
5	Sans solde	2026-12-14	2026-12-18	Refusé	Raisons personnelles	10
6	Congé payé	2026-11-16	2026-11-20	Approuvé	\N	12
7	Maladie	2026-10-26	2026-10-30	Approuvé	Certificat médical	15
8	Sans solde	2026-12-01	2026-12-05	En attente	Affaires familiales	19
9	Congé payé	2026-12-22	2026-12-31	En attente	\N	20
10	Maternité	2026-11-08	2026-11-15	Approuvé	fgdfgdfgd	22
\.


--
-- Data for Name: contrat; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.contrat (id, type_contrat, date_debut, date_fin, salaire_actuel, employe_id) FROM stdin;
1	CDI	2024-01-02	\N	1200000.00	1
2	CDI	2020-02-03	\N	4500000.00	2
3	CDI	2022-06-01	\N	1500000.00	3
4	CDI	2021-09-15	\N	1100000.00	4
5	CDD	2023-03-10	2027-03-09	550000.00	5
6	CDI	2023-08-01	\N	650000.00	6
7	CDD	2025-02-17	2027-02-16	1000000.00	7
8	Stage	2026-05-05	2027-05-04	300000.00	8
9	CDI	2019-10-01	\N	650000.00	9
10	Prestataire	2026-01-12	2026-12-31	700000.00	10
11	CDI	2021-03-01	\N	1800000.00	11
12	CDI	2022-09-12	\N	1000000.00	12
13	CDD	2024-04-08	2027-04-07	520000.00	13
14	CDI	2020-11-02	\N	1100000.00	14
15	CDD	2025-06-02	2027-06-01	480000.00	15
16	CDI	2023-01-16	\N	650000.00	16
17	CDI	2018-07-02	\N	600000.00	17
18	Stage	2026-07-01	2027-06-30	300000.00	18
19	CDI	2022-02-14	\N	600000.00	19
20	CDI	2024-10-07	\N	680000.00	20
\.


--
-- Data for Name: departement; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.departement (id, nom, description, created_at) FROM stdin;
1	Marketing	Communication, publicité et études de marché	2026-11-07 05:19:49.548
2	Comptabilité	Comptabilité, finances et paie	2026-11-07 05:19:49.554
3	Production	Fabrication et contrôle qualité	2026-11-07 05:19:49.557
4	Logistique	Approvisionnement, stock et transport	2026-11-07 05:19:49.56
5	Ressources Humaines	Gestion du personnel et recrutement	2026-11-07 05:19:49.563
6	Informatique	Systèmes d'information et support technique	2026-11-07 05:19:49.567
\.


--
-- Data for Name: employe; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employe (id, matricule, nom, prenom, date_naissance, sexe, email, telephone, adresse, photo, date_embauche, statut, poste_id, created_at) FROM stdin;
1	EMP-0001	Rakoto	Jean	1990-05-12	M	jean.rakoto@entreprise.mg	0340000000	Lot II A 12 Ankadifotsy, Antananarivo	\N	2024-01-02	Actif	6	2026-11-07 05:19:49.623
2	EMP-0002	Rasoamanana	Voahangy	1984-03-21	F	voahangy.rasoamanana@entreprise.mg	0321100002	Ivandry, Antananarivo	\N	2020-02-03	Actif	1	2026-11-07 05:19:49.647
3	EMP-0003	Randria	Mamy	1992-09-30	M	mamy.randria@entreprise.mg	0331100003	Ambohimanarina, Antananarivo	\N	2022-06-01	Actif	4	2026-11-07 05:19:49.665
4	EMP-0004	Rabe	Fanja	1991-11-08	F	fanja.rabe@entreprise.mg	0341100004	Analakely, Antananarivo	\N	2021-09-15	Actif	5	2026-11-07 05:19:49.681
5	EMP-0005	Andrianina	Tojo	1985-07-19	M	tojo.andrianina@entreprise.mg	0381100005	Anosibe, Antananarivo	\N	2023-03-10	Actif	3	2026-11-07 05:19:49.698
6	EMP-0006	Razafy	Lalaina	1995-01-25	F	lalaina.razafy@entreprise.mg	0321100006	Ankorondrano, Antananarivo	\N	2023-08-01	En congé	2	2026-11-07 05:19:49.714
7	EMP-0007	Ravelo	Hery	1994-04-14	M	hery.ravelo@entreprise.mg	0331100007	Tanjombato, Antananarivo	\N	2025-02-17	Actif	4	2026-11-07 05:19:49.731
8	EMP-0008	Rakotomalala	Soa	1999-12-02	F	soa.rakotomalala@entreprise.mg	0341100008	Itaosy, Antananarivo	\N	2026-05-05	Actif	5	2026-11-07 05:19:49.747
9	EMP-0009	Rasolofo	Nirina	1987-06-06	M	nirina.rasolofo@entreprise.mg	0381100009	Ampefiloha, Antananarivo	\N	2019-10-01	Démissionnaire	3	2026-11-07 05:19:49.759
10	EMP-0010	Ramanana	Mialy	1997-08-17	F	mialy.ramanana@entreprise.mg	0321100010	Andraharo, Antananarivo	\N	2026-01-12	Actif	2	2026-11-07 05:19:49.77
11	EMP-0011	Rakotondrabe	Hasina	1988-02-11	M	hasina.rakotondrabe@entreprise.mg	0341100011	Ambatonakanga, Antananarivo	\N	2021-03-01	Actif	7	2026-11-07 05:19:49.782
12	EMP-0012	Andriamampianina	Fara	1993-06-28	F	fara.andriamampianina@entreprise.mg	0321100012	Behoririka, Antananarivo	\N	2022-09-12	Actif	8	2026-11-07 05:19:49.791
13	EMP-0013	Rajaonarison	Tiana	1996-10-03	M	tiana.rajaonarison@entreprise.mg	0331100013	Ankadikely Ilafy, Antananarivo	\N	2024-04-08	Actif	9	2026-11-07 05:19:49.802
14	EMP-0014	Razanamahefa	Liva	1990-01-19	F	liva.razanamahefa@entreprise.mg	0381100014	Isotry, Antananarivo	\N	2020-11-02	Actif	10	2026-11-07 05:19:49.81
15	EMP-0015	Rasolonjatovo	Fenitra	1998-05-23	M	fenitra.rasolonjatovo@entreprise.mg	0341100015	Ambohipo, Antananarivo	\N	2025-06-02	Actif	11	2026-11-07 05:19:49.818
16	EMP-0016	Ravaoarisoa	Hanta	1992-09-09	F	hanta.ravaoarisoa@entreprise.mg	0321100016	Mahamasina, Antananarivo	\N	2023-01-16	Actif	12	2026-11-07 05:19:49.828
17	EMP-0017	Randrianasolo	Dina	1986-12-14	M	dina.randrianasolo@entreprise.mg	0331100017	Anosizato, Antananarivo	\N	2018-07-02	Licencié	9	2026-11-07 05:19:49.835
18	EMP-0018	Rafanomezana	Mino	2000-03-30	F	mino.rafanomezana@entreprise.mg	0341100018	Ambohijatovo, Antananarivo	\N	2026-07-01	Actif	8	2026-11-07 05:19:49.843
19	EMP-0019	Andrianjafy	Tahina	1989-08-05	M	tahina.andrianjafy@entreprise.mg	0381100019	Tsiadana, Antananarivo	\N	2022-02-14	Actif	3	2026-11-07 05:19:49.851
20	EMP-0020	Rabemananjara	Sitraka	1994-11-27	F	sitraka.rabemananjara@entreprise.mg	0321100020	Soanierana, Antananarivo	\N	2024-10-07	Actif	2	2026-11-07 05:19:49.862
22	EMP-00060	Bebe	Jaona	2018-07-08	F	beb@gmail.com	0321100016	Lot II 10 Antananarivo	\N	2026-11-08	Actif	9	2026-11-08 04:14:28.248
\.


--
-- Data for Name: paie; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.paie (id, mois, annee_id, salaire_net, primes, deductions, date_paiement, employe_id) FROM stdin;
1	10	1	1104000.00	50000.00	0.00	2026-10-30	1
2	10	1	4140000.00	50000.00	0.00	2026-10-30	2
3	10	1	1380000.00	50000.00	0.00	2026-10-30	3
4	10	1	1012000.00	50000.00	0.00	2026-10-30	4
5	10	1	506000.00	0.00	0.00	2026-10-30	5
6	10	1	598000.00	50000.00	0.00	2026-10-30	6
7	10	1	920000.00	0.00	0.00	2026-10-30	7
8	10	1	276000.00	0.00	0.00	2026-10-30	8
9	10	1	598000.00	50000.00	0.00	2026-10-30	9
10	10	1	644000.00	0.00	0.00	2026-10-30	10
11	10	1	1656000.00	50000.00	0.00	2026-10-30	11
12	10	1	920000.00	50000.00	0.00	2026-10-30	12
13	10	1	478400.00	0.00	0.00	2026-10-30	13
14	10	1	1012000.00	50000.00	0.00	2026-10-30	14
15	10	1	441600.00	0.00	0.00	2026-10-30	15
16	10	1	598000.00	50000.00	0.00	2026-10-30	16
17	10	1	552000.00	50000.00	0.00	2026-10-30	17
18	10	1	276000.00	0.00	0.00	2026-10-30	18
19	10	1	552000.00	50000.00	0.00	2026-10-30	19
20	10	1	625600.00	50000.00	0.00	2026-10-30	20
\.


--
-- Data for Name: parametre; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.parametre (cle, valeur) FROM stdin;
seed_demo_communication_v1	2026-11-08T03:54:51.069Z
\.


--
-- Data for Name: poste; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.poste (id, intitule, salaire_base_min, salaire_base_max, departement_id) FROM stdin;
1	Directeur	3000000.00	6000000.00	\N
2	Secrétaire	500000.00	900000.00	5
3	Chauffeur	400000.00	700000.00	4
4	Informaticien	900000.00	2000000.00	6
5	Comptable	800000.00	1800000.00	2
6	Responsable RH	1000000.00	2500000.00	5
7	Responsable Marketing	1000000.00	2500000.00	1
8	Chargé de communication	700000.00	1500000.00	1
9	Agent de production	450000.00	800000.00	3
10	Contrôleur qualité	700000.00	1400000.00	3
11	Magasinier	450000.00	800000.00	4
12	Assistant comptable	500000.00	900000.00	2
\.


--
-- Data for Name: sanction; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sanction (id, type, date, motif, description, statut, employe_id, created_at) FROM stdin;
1	Avertissement oral	2026-03-15	Retards répétés	Trois retards constatés en février 2026. Avertissement oral donné en entretien.	Levé	3	2026-11-07 05:19:49.889
2	Avertissement écrit	2026-06-10	Non-respect des consignes de sécurité	Port des EPI non respecté en zone de production.	Actif	3	2026-11-07 05:19:49.889
3	Blâme	2026-09-02	Comportement inapproprié envers un collègue	Propos déplacés lors d'une réunion d'équipe. Blâme formalisé.	Actif	2	2026-11-07 05:19:49.889
4	Avertissement oral	2026-02-10	Retards répétés	Quatre retards constatés en janvier 2026. Avertissement oral donné par le chef d'atelier.	Levé	13	2026-11-07 05:19:49.898
5	Avertissement écrit	2026-04-22	Absences injustifiées	Deux journées d'absence sans justificatif ni information préalable.	Actif	17	2026-11-07 05:19:49.903
6	Mise à pied	2026-08-05	Abandon de poste	Départ de la ligne de production sans autorisation pendant le service. Mise à pied de 3 jours.	Actif	17	2026-11-07 05:19:49.909
7	Blâme	2026-09-14	Négligence dans la gestion du stock	Écarts d'inventaire répétés sur les entrées de marchandises non enregistrées.	Actif	15	2026-11-07 05:19:49.913
8	Retenue sur salaire	2026-10-05	Écart de caisse non justifié	Écart de caisse non signalé à la hiérarchie. Retenue appliquée sur le salaire d'octobre.	Actif	16	2026-11-07 05:19:49.918
9	Avertissement écrit	2026-07-20	Usage non autorisé du véhicule de service	Véhicule utilisé en dehors des missions planifiées. Situation régularisée.	Levé	19	2026-11-07 05:19:49.923
\.


--
-- Name: annee_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.annee_id_seq', 1, true);


--
-- Name: conge_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.conge_id_seq', 10, true);


--
-- Name: contrat_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.contrat_id_seq', 20, true);


--
-- Name: departement_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.departement_id_seq', 6, true);


--
-- Name: employe_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.employe_id_seq', 22, true);


--
-- Name: paie_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.paie_id_seq', 21, true);


--
-- Name: poste_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.poste_id_seq', 12, true);


--
-- Name: sanction_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sanction_id_seq', 10, true);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: annee annee_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.annee
    ADD CONSTRAINT annee_pkey PRIMARY KEY (id);


--
-- Name: conge conge_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conge
    ADD CONSTRAINT conge_pkey PRIMARY KEY (id);


--
-- Name: contrat contrat_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contrat
    ADD CONSTRAINT contrat_pkey PRIMARY KEY (id);


--
-- Name: departement departement_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departement
    ADD CONSTRAINT departement_pkey PRIMARY KEY (id);


--
-- Name: employe employe_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employe
    ADD CONSTRAINT employe_pkey PRIMARY KEY (id);


--
-- Name: paie paie_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.paie
    ADD CONSTRAINT paie_pkey PRIMARY KEY (id);


--
-- Name: parametre parametre_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parametre
    ADD CONSTRAINT parametre_pkey PRIMARY KEY (cle);


--
-- Name: poste poste_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.poste
    ADD CONSTRAINT poste_pkey PRIMARY KEY (id);


--
-- Name: sanction sanction_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sanction
    ADD CONSTRAINT sanction_pkey PRIMARY KEY (id);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: annee_annee_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX annee_annee_key ON public.annee USING btree (annee);


--
-- Name: conge_employe_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX conge_employe_id_idx ON public.conge USING btree (employe_id);


--
-- Name: contrat_employe_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX contrat_employe_id_idx ON public.contrat USING btree (employe_id);


--
-- Name: departement_nom_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX departement_nom_key ON public.departement USING btree (nom);


--
-- Name: employe_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX employe_email_key ON public.employe USING btree (email);


--
-- Name: employe_matricule_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX employe_matricule_key ON public.employe USING btree (matricule);


--
-- Name: employe_poste_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX employe_poste_id_idx ON public.employe USING btree (poste_id);


--
-- Name: paie_annee_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX paie_annee_id_idx ON public.paie USING btree (annee_id);


--
-- Name: paie_employe_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX paie_employe_id_idx ON public.paie USING btree (employe_id);


--
-- Name: poste_departement_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX poste_departement_id_idx ON public.poste USING btree (departement_id);


--
-- Name: sanction_employe_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sanction_employe_id_idx ON public.sanction USING btree (employe_id);


--
-- Name: conge conge_employe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conge
    ADD CONSTRAINT conge_employe_id_fkey FOREIGN KEY (employe_id) REFERENCES public.employe(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: contrat contrat_employe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contrat
    ADD CONSTRAINT contrat_employe_id_fkey FOREIGN KEY (employe_id) REFERENCES public.employe(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: employe employe_poste_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employe
    ADD CONSTRAINT employe_poste_id_fkey FOREIGN KEY (poste_id) REFERENCES public.poste(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: paie paie_annee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.paie
    ADD CONSTRAINT paie_annee_id_fkey FOREIGN KEY (annee_id) REFERENCES public.annee(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: paie paie_employe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.paie
    ADD CONSTRAINT paie_employe_id_fkey FOREIGN KEY (employe_id) REFERENCES public.employe(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: poste poste_departement_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.poste
    ADD CONSTRAINT poste_departement_id_fkey FOREIGN KEY (departement_id) REFERENCES public.departement(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: sanction sanction_employe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sanction
    ADD CONSTRAINT sanction_employe_id_fkey FOREIGN KEY (employe_id) REFERENCES public.employe(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict eSy0H7w53TLIGQF2rLSauafmpv59vfMSa0RMn9jHfkdh3YtKdERd4zBm0Mkeyn8

