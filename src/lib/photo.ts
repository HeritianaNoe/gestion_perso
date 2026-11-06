// Sans dépendance serveur : utilisable côté client et serveur.
// Avatars par défaut (public/avatars) : 2-3 = femme, 4-5 = homme.
const FEMME = ["/avatars/avatar2.png", "/avatars/avatar3.png"];
const HOMME = ["/avatars/avatar4.png", "/avatars/avatar5.png"];

export function defaultAvatar(sexe?: string | null, id?: number | null): string {
  const list = sexe === "F" ? FEMME : HOMME;
  return list[Math.abs(Number(id) || 0) % list.length];
}

// Photo de l'employé si elle existe en base, sinon avatar par défaut
export function photoUrl(photo?: string | null, sexe?: string | null, id?: number | null): string {
  return photo ? `/api/files/${encodeURIComponent(photo)}` : defaultAvatar(sexe, id);
}
