"use client";

import { useActionState } from "react";
import { AlertCircle, Loader2, Lock, LogIn, Mail, Users } from "lucide-react";
import { login } from "./actions";

export default function LoginPage() {
  const [error, formAction, pending] = useActionState(login, undefined);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 p-4">
      {/* Soft decorative background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-100/60 blur-3xl" />
        <div className="absolute -bottom-40 -right-32 h-[28rem] w-[28rem] rounded-full bg-violet-100/50 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-blue-50/80 blur-3xl" />
      </div>

      <form
        action={formAction}
        className="relative w-full max-w-[400px] space-y-6 rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xl shadow-slate-200/50"
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
            <Users size={28} aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">Gestion du Personnel</h1>
            <p className="mt-1 text-sm text-slate-500">Connectez-vous à votre espace RH</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <Mail
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              name="email"
              type="email"
              required
              placeholder="Adresse email"
              autoComplete="email"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-3.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>
          <div className="relative">
            <Lock
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              name="password"
              type="password"
              required
              minLength={8}
              placeholder="Mot de passe"
              autoComplete="current-password"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-3.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-3.5 py-3 text-sm text-red-700">
            <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={pending}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? (
            <>
              <Loader2 size={17} className="animate-spin" />
              Connexion...
            </>
          ) : (
            <>
              <LogIn size={17} />
              Se connecter
            </>
          )}
        </button>

        <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-3.5 py-3 text-[11px] leading-relaxed text-slate-500">
          <p className="mb-1 font-semibold text-slate-600">Comptes de démonstration</p>
          <p>Admin : admin@entreprise.mg / Admin@12345</p>
          <p>Directeur : directeur@entreprise.mg / Directeur@2026</p>
          <p>Comptable : comptable@entreprise.mg / Comptable@2026</p>
        </div>
      </form>
    </main>
  );
}
