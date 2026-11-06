import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import type { FieldDef, Relations, Row } from "./types";

export const fmtDate = (v: unknown) => {
  const [y, m, d] = String(v).slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
};

export const fmtNumber = (v: unknown) =>
  Number(v).toLocaleString("fr-FR", { maximumFractionDigits: 2 });

/** Affiche nom + prénom avec photo pour un employé */
function PersonCell({
  nom, prenom, photo, sexe, id, matricule,
}: {
  nom?: string; prenom?: string; photo?: string | null; sexe?: string | null;
  id?: number | null; matricule?: string;
}) {
  const name = [prenom, nom].filter(Boolean).join(" ") || "—";
  return (
    <span className="inline-flex items-center gap-2.5">
      <Avatar photo={photo} sexe={sexe} id={id} alt={name} size={32} />
      <span className="min-w-0">
        <span className="block truncate font-medium text-slate-800">{name}</span>
        {matricule && <span className="block text-xs text-slate-400">{matricule}</span>}
      </span>
    </span>
  );
}

export function display(f: FieldDef, v: unknown, relations: Relations, row?: Row): React.ReactNode {
  if (f.type === "image")
    return <Avatar photo={v as string | null} sexe={row?.sexe} id={row?.id} alt={`Photo ${row?.prenom ?? ""} ${row?.nom ?? ""}`.trim()} />;

  // Colonne Nom sur table employés : photo + nom + prénom
  if (f.name === "nom" && row && ("prenom" in row || "photo" in row) && row.prenom !== undefined) {
    return (
      <PersonCell
        nom={row.nom}
        prenom={row.prenom}
        photo={row.photo}
        sexe={row.sexe}
        id={row.id}
      />
    );
  }

  if (v === null || v === undefined || v === "") return <span className="text-gray-400">—</span>;

  switch (f.type) {
    case "date": return fmtDate(v);
    case "decimal": return `${fmtNumber(v)}${f.unit ? ` ${f.unit}` : ""}`;
    case "enum": return <Badge value={String(v)} label={f.options?.find((o) => o.value === v)?.label} />;
    case "relation": {
      const related =
        (f.name === "employeId" && row?.employe) ||
        (f.name === "auteurId" && row?.auteur) ||
        null;
      if (related && (related.nom || related.prenom)) {
        return (
          <PersonCell
            nom={related.nom}
            prenom={related.prenom}
            photo={related.photo}
            sexe={related.sexe}
            id={related.id}
            matricule={related.matricule}
          />
        );
      }
      return relations[f.relation!]?.find((o) => o.value === String(v))?.label ?? `#${v}`;
    }
    default: return String(v);
  }
}
