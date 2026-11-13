import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { THEME_COOKIE, DEFAULT_THEME, isTheme, type ThemeKey } from "@/lib/theme";

export const metadata: Metadata = {
  title: "Gestion du Personnel",
  description: "Gestion des employés et ressources humaines",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const saved = (await cookies()).get(THEME_COOKIE)?.value;
  const theme: ThemeKey = isTheme(saved) ? saved : DEFAULT_THEME;

  return (
    <html lang="fr" data-theme={theme === "indigo" ? undefined : theme}>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">{children}</body>
    </html>
  );
}
