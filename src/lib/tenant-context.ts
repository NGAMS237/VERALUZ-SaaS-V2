/**
 * src/lib/tenant-context.ts
 * Résolution du contexte tenant mémoïsée pour la durée d'une requête (React cache).
 *
 * Évite de résoudre le tenant plusieurs fois lorsque le layout et la page
 * d'un même segment ont chacun besoin du contexte (tenant, rôle, utilisateur).
 */

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { resolveTenantContext, type TenantContext } from "@/modules/tenant/resolver";

export const getTenantContext = cache(async (tenantSlug: string): Promise<TenantContext> => {
  const supabase = await createClient();
  return resolveTenantContext(supabase, tenantSlug);
});

export function canWrite(role: TenantContext["role"]): boolean {
  return role === "owner" || role === "admin";
}
