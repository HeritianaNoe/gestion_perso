import type { Role } from "@prisma/client";

export type Permission = "data:read" | "data:write" | "data:delete";

const MATRIX: Record<Role, Permission[]> = {
  ADMIN: ["data:read", "data:write", "data:delete"],
  RH: ["data:read", "data:write"],
  MANAGER: ["data:read"],
  EMPLOYE: [],
};

export const can = (role: Role | undefined, perm: Permission) =>
  !!role && MATRIX[role].includes(perm);
