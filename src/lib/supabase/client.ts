/**
 * src/lib/supabase/client.ts
 * Client Supabase côté navigateur (singleton).
 *
 * À utiliser uniquement dans les Client Components ("use client").
 * N'utilise jamais la clé service_role.
 */

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/database.types";

/**
 * Crée (ou réutilise) le client Supabase côté navigateur.
 * Les cookies de session sont gérés automatiquement par @supabase/ssr.
 */
export function createClient() {
  const supabaseUrl = process.env["NEXT_PUBLIC_SUPABASE_URL"];
  const supabaseKey = process.env["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"];

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY " +
        "doivent être définis. Vérifier .env.local.",
    );
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseKey);
}
