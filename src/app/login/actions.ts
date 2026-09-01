/**
 * src/app/login/actions.ts
 * Server Actions — connexion et déconnexion Supabase Auth.
 *
 * Email + mot de passe uniquement (F1).
 */

"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData): Promise<void> {
  const email = formData.get("email");
  const password = formData.get("password");
  const redirectTo = formData.get("redirectTo");

  if (typeof email !== "string" || typeof password !== "string") {
    redirect("/login?error=missing_fields");
  }

  if (email.trim() === "" || password.trim() === "") {
    redirect("/login?error=missing_fields");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error !== null) {
    redirect("/login?error=invalid_credentials");
  }

  // Après connexion réussie, rediriger vers la destination demandée ou l'accueil.
  const isValidRedirect = typeof redirectTo === "string" && redirectTo.startsWith("/t/");
  const destination = isValidRedirect ? redirectTo : "/";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  redirect(destination as any);
}

export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
