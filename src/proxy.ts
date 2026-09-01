/**
 * src/proxy.ts
 * Proxy Next.js 16 — Rafraîchissement de session Supabase.
 *
 * Dans Next.js 16, ce fichier s'appelle proxy.ts (non middleware.ts).
 * Son rôle principal est de rafraîchir la session Supabase à chaque requête
 * et de propager les cookies mis à jour vers la réponse.
 *
 * IMPORTANT : Ne jamais faire confiance à un tenant_id fourni par le navigateur.
 * La résolution du tenant est réalisée côté serveur dans /t/[tenantSlug]/layout.tsx.
 *
 * @see docs/MULTITENANCY_AND_SECURITY.md
 */

import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import type { Database } from "@/lib/database.types";

export async function proxy(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env["NEXT_PUBLIC_SUPABASE_URL"];
  const supabaseKey = process.env["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"];

  // Si Supabase n'est pas configuré (ex: test ou build sans env), passer la requête.
  if (!supabaseUrl || !supabaseKey) {
    return response;
  }

  const supabase = createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // Rafraîchir la session — utiliser getClaims() pour valider le JWT côté serveur.
  // getSession() est intentionnellement évité : il ne valide pas le JWT.
  await supabase.auth.getClaims();

  return response;
}

export const config = {
  matcher: [
    /*
     * Exclure les assets statiques et les routes Next.js internes.
     * Seules les vraies requêtes de pages et d'API sont traitées.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
