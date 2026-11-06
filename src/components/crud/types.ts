// Types partagés client/serveur (sans fonctions)
export type Opt = { value: string; label: string };

export type FieldType =
  | "text" | "textarea" | "email" | "tel"
  | "int" | "decimal" | "date" | "enum" | "relation" | "image";

export type FieldDef = {
  name: string;          // nom du champ Prisma (camelCase)
  label: string;
  type: FieldType;
  required?: boolean;
  list?: boolean;        // affiché dans le tableau
  options?: Opt[];       // pour les enums
  relation?: string;     // clé de la ressource cible (relation)
  min?: number;
  max?: number;
  maxLength?: number;
  defaultValue?: string;
  unit?: string;
  icon?: IconName;       // icône affichée à côté du libellé
};

export type IconName =
  | "calendar" | "building" | "briefcase" | "users" | "file" | "palm" | "wallet"
  | "user" | "idcard" | "mail" | "phone" | "cake" | "gender" | "pin" | "calendarPlus"
  | "calendarCheck" | "calendarRange" | "activity" | "text" | "banknote" | "gift"
  | "minus" | "message" | "image" | "hash" | "layers" | "megaphone" | "alert" | "layoutDashboard";

export type ClientResource = {
  key: string;
  singular: string;
  plural: string;
  icon: IconName;
  fields: FieldDef[];
  deleteWarning?: string;
};

// Pour les lignes : id + sexe servent à choisir l'avatar par défaut
export type Row = Record<string, any> & { id: number };
export type Relations = Record<string, Opt[]>;
