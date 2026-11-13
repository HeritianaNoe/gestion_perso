export const THEME_COOKIE = "perso_theme";

export const THEMES = {
  indigo: {
    label: "Indigo (par défaut)",
    description: "Violet / indigo clair",
  },
  gray: {
    label: "Gris foncé",
    description: "Gris foncé & blanc",
  },
  red: {
    label: "Rouge foncé",
    description: "Rouge foncé & blanc",
  },
  green: {
    label: "Vert foncé",
    description: "Vert foncé & blanc",
  },
} as const;

export type ThemeKey = keyof typeof THEMES;
export const DEFAULT_THEME: ThemeKey = "indigo";

export function isTheme(value: unknown): value is ThemeKey {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(THEMES, value);
}
