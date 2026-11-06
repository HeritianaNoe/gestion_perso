"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { can, type Permission } from "@/lib/rbac";
import { getResource } from "@/lib/resources";
import { delegate, parseForm } from "@/lib/crud";
import { removeImage, saveImage } from "@/lib/uploads";

export type ActionState =
  | { ok: boolean; errors?: Record<string, string>; message?: string }
  | undefined;

async function allowed(perm: Permission) {
  const session = await auth();
  return !!session?.user && can(session.user.role, perm);
}

function prismaError(e: unknown, mode: "save" | "delete"): NonNullable<ActionState> {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    if (e.code === "P2002") {
      const target = (e.meta?.target as string[] | string | undefined) ?? [];
      const field = Array.isArray(target) ? target[0] : target;
      return field
        ? { ok: false, errors: { [field]: "Cette valeur existe déjà" } }
        : { ok: false, message: "Cet enregistrement existe déjà" };
    }
    if (e.code === "P2003")
      return {
        ok: false,
        message: mode === "delete"
          ? "Suppression impossible : cet élément est encore utilisé par d'autres données."
          : "L'élément lié sélectionné n'existe plus.",
      };
    if (e.code === "P2025") return { ok: false, message: "Enregistrement introuvable (déjà supprimé ?)." };
  }
  console.error(e);
  return { ok: false, message: "Une erreur inattendue est survenue." };
}

export async function saveRecord(
  key: string,
  id: number | null,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const r = getResource(key);
  if (!r) return { ok: false, message: "Table inconnue." };
  if (!(await allowed("data:write"))) return { ok: false, message: "Accès non autorisé." };

  const { data, errors } = parseForm(r, formData);
  if (Object.keys(errors).length) return { ok: false, errors };

  // ── Images (photo) : envoi, remplacement ou retrait ──
  const imageFields = r.fields.filter((f) => f.type === "image");
  const saved: string[] = [];      // nouveaux fichiers (à nettoyer si l'écriture en base échoue)
  const obsolete: string[] = [];   // anciens fichiers (supprimés après succès)
  if (imageFields.length) {
    const old = id != null ? await delegate(r).findUnique({ where: { id } }) : null;
    const imgErrors: Record<string, string> = {};
    for (const f of imageFields) {
      const file = formData.get(f.name);
      if (file instanceof File && file.size > 0) {
        const res = await saveImage(file);
        if (res.error) { imgErrors[f.name] = res.error; continue; }
        saved.push(res.name!);
        data[f.name] = res.name;
        if (old?.[f.name]) obsolete.push(old[f.name]);
      } else if (formData.get(`${f.name}__remove`) === "1") {
        data[f.name] = null;
        if (old?.[f.name]) obsolete.push(old[f.name]);
      }
    }
    if (Object.keys(imgErrors).length) {
      await Promise.all(saved.map(removeImage));
      return { ok: false, errors: imgErrors };
    }
  }

  try {
    if (id == null) await delegate(r).create({ data });
    else await delegate(r).update({ where: { id }, data });
  } catch (e) {
    await Promise.all(saved.map(removeImage));
    return prismaError(e, "save");
  }
  await Promise.all(obsolete.map(removeImage));
  revalidatePath(`/${r.key}`);
  return { ok: true };
}

export async function deleteRecord(key: string, id: number): Promise<NonNullable<ActionState>> {
  const r = getResource(key);
  if (!r) return { ok: false, message: "Table inconnue." };
  if (!(await allowed("data:delete"))) return { ok: false, message: "Accès non autorisé." };

  const imageFields = r.fields.filter((f) => f.type === "image");
  const old = imageFields.length ? await delegate(r).findUnique({ where: { id } }) : null;

  try {
    await delegate(r).delete({ where: { id } });
  } catch (e) {
    return prismaError(e, "delete");
  }
  if (old) await Promise.all(imageFields.map((f) => removeImage(old[f.name])));
  revalidatePath(`/${r.key}`);
  return { ok: true };
}
