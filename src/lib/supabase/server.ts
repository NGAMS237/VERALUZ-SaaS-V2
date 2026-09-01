/**
 * src/lib/supabase/server.ts
 * Client Supabase côté serveur (Server Components, Route Handlers, Actions).
 *
 * Utilise @supabase/ssr pour lire et écrire les cookies de session côté serveur.
 * Ne jamais utiliser createBrowserClient dans un contexte serveur.
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/database.types";

/**
 * Crée le client Supabase côté serveur avec gestion des cookies.
 * Doit être appelé dans un contexte asynchrone (Server Component ou Route Handler).
 */
export async function createClient() {
  const cookieStore = await cookies();

  const supabaseUrl = process.env["NEXT_PUBLIC_SUPABASE_URL"];
  const supabaseKey = process.env["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"];

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY " +
        "doivent être définis. Vérifier .env.local.",
    );
  }

  return createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // setAll peut échouer dans les Server Components en lecture seule.
          // Le rafraîchissement de session est géré par le proxy (src/proxy.ts).
        }
      },
    },
  });
}
