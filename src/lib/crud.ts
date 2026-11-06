// Logique serveur du CRUD (pas de "use server" : non exposé comme endpoint)
import { prisma } from "@/lib/prisma";
import { RESOURCES, type Resource, type ResourceKey } from "@/lib/resources";
import type { Relations } from "@/components/crud/types";

export const delegate = (r: Resource) => (prisma as any)[r.model];

function buildWhere(r: Resource, q?: string) {
  const term = q?.trim();
  if (!term || r.search.length === 0) return {};
  const OR = r.search.flatMap((path) => {
    const parts = path.split(".");
    const field = parts.length === 1 ? r.fields.find((f) => f.name === path) : undefined;
    let cond: any;
    if (field?.type === "int") {
      if (!/^\d{1,9}$/.test(term)) return [];
      cond = Number(term);
    } else {
      cond = { contains: term, mode: "insensitive" };
    }
    return [parts.reduceRight<any>((acc, key) => ({ [key]: acc }), cond)];
  });
  return OR.length ? { OR } : {};
}

export async function listRecords(r: Resource, p: { q?: string; page?: number; size?: number }) {
  const { q, page = 1, size = 10 } = p;
  const where = buildWhere(r, q);
  const [items, total] = await Promise.all([
    delegate(r).findMany({
      where,
      orderBy: r.orderBy,
      skip: (page - 1) * size,
      take: size,
      ...(r.include ? { include: r.include } : {}),
    }),
    delegate(r).count({ where }),
  ]);
  return {
    // JSON : Date -> chaîne ISO, Decimal -> chaîne (transmissible au client)
    items: JSON.parse(JSON.stringify(items)) as any[],
    total,
    pages: Math.max(1, Math.ceil(total / size)),
  };
}

export async function getRelationOptions(r: Resource): Promise<Relations> {
  const out: Relations = {};
  for (const f of r.fields) {
    if (f.type !== "relation" || !f.relation || out[f.relation]) continue;
    const target = RESOURCES[f.relation as ResourceKey];
    const rows = await delegate(target).findMany({ orderBy: target.orderBy });
    out[f.relation] = rows.map((x: any) => ({ value: String(x.id), label: target.optionLabel(x) }));
  }
  return out;
}

const REQUIRED = "Ce champ est obligatoire";

export function parseForm(r: Resource, fd: FormData) {
  const data: Record<string, any> = {};
  const errors: Record<string, string> = {};

  for (const f of r.fields) {
    if (f.type === "image") continue; // fichier : traité dans saveRecord
    let raw = String(fd.get(f.name) ?? "").trim();
    if (!raw && f.defaultValue !== undefined) raw = f.defaultValue;
    if (!raw) {
      if (f.required) errors[f.name] = REQUIRED;
      else data[f.name] = null;
      continue;
    }

    switch (f.type) {
      case "text":
      case "textarea":
      case "email":
      case "tel": {
        if (f.maxLength && raw.length > f.maxLength) { errors[f.name] = `${f.maxLength} caractères maximum`; break; }
        if (f.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) { errors[f.name] = "Email invalide"; break; }
        data[f.name] = raw;
        break;
      }
      case "int": {
        const n = Number(raw);
        if (!Number.isInteger(n)) { errors[f.name] = "Nombre entier requis"; break; }
        if (f.min != null && n < f.min) { errors[f.name] = `Minimum : ${f.min}`; break; }
        if (f.max != null && n > f.max) { errors[f.name] = `Maximum : ${f.max}`; break; }
        data[f.name] = n;
        break;
      }
      case "decimal": {
        const n = Number(raw);
        if (!Number.isFinite(n)) { errors[f.name] = "Nombre invalide"; break; }
        if (n < (f.min ?? 0)) { errors[f.name] = "Ne peut pas être négatif"; break; }
        if (n >= 1e8) { errors[f.name] = "Valeur trop grande"; break; }
        data[f.name] = n;
        break;
      }
      case "date": {
        const d = new Date(`${raw}T00:00:00.000Z`);
        if (!/^\d{4}-\d{2}-\d{2}$/.test(raw) || Number.isNaN(+d)) { errors[f.name] = "Date invalide"; break; }
        data[f.name] = d;
        break;
      }
      case "enum": {
        if (!f.options?.some((o) => o.value === raw)) { errors[f.name] = "Choix invalide"; break; }
        data[f.name] = raw;
        break;
      }
      case "relation": {
        const n = Number(raw);
        if (!Number.isInteger(n) || n <= 0) { errors[f.name] = "Choix invalide"; break; }
        data[f.name] = n;
        break;
      }
    }
  }

  if (Object.keys(errors).length === 0 && r.validate) Object.assign(errors, r.validate(data));
  return { data, errors };
}
