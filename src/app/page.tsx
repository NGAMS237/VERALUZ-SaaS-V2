/**
 * src/app/page.tsx
 * Racine de l'application — redirige vers la connexion.
 *
 * La page "en construction" du lot F0 est retirée : UI-1 livre le shell
 * applicatif et l'authentification est le point d'entrée réel.
 */

import { redirect } from "next/navigation";

export default function HomePage(): never {
  redirect("/login");
}
