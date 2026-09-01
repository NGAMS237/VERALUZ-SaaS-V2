/**
 * POST /api/kjemo/v1/auth/logout
 * Déconnexion Supabase Auth — invalide la session côté serveur.
 */

import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(_request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  await supabase.auth.signOut();

  return NextResponse.redirect(new URL("/login", _request.url));
}
