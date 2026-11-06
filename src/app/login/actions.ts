"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export async function login(_: string | undefined, formData: FormData) {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/employes",
    });
  } catch (error) {
    if (error instanceof AuthError) return "Email ou mot de passe incorrect.";
    throw error; // nécessaire pour la redirection Next.js
  }
}
