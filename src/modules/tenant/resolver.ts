/**
 * src/modules/tenant/resolver.ts
 * Résolveur métier de tenant — séparé de l'UI et du transport.
 *
 * Toute résolution de tenant passe par ce module.
 * Ne jamais faire confiance au slug seul pour autoriser l'accès aux données.
 *
 * @see docs/MULTITENANCY_AND_SECURITY.md
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Tenant, MembershipRole } from "@/lib/database.types";

/** Validation syntaxique du slug de tenant */
const TENANT_SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/;

export class TenantSlugError extends Error {
  constructor(slug: string) {
    super(`Slug de tenant invalide: "${slug}"`);
    this.name = "TenantSlugError";
  }
}

export class TenantNotFoundError extends Error {
  constructor(slug: string) {
    super(`Tenant introuvable: "${slug}"`);
    this.name = "TenantNotFoundError";
  }
}

export class TenantAccessDeniedError extends Error {
  constructor(slug: string) {
    super(`Accès refusé au tenant: "${slug}"`);
    this.name = "TenantAccessDeniedError";
  }
}

export interface TenantContext {
  tenant: Tenant;
  role: MembershipRole;
  userId: string;
}

/**
 * Valide la syntaxe d'un slug de tenant.
 * Les slugs invalides sont rejetés avant toute requête DB.
 */
export function validateTenantSlug(slug: string): boolean {
  return TENANT_SLUG_PATTERN.test(slug);
}

/**
 * Résout le contexte tenant pour un utilisateur authentifié.
 *
 * Étapes :
 * 1. Valider la syntaxe du slug
 * 2. Vérifier l'authentification (getClaims)
 * 3. Chercher le tenant par slug (via RLS — seuls les tenants accessibles sont retournés)
 * 4. Vérifier l'appartenance et récupérer le rôle
 *
 * @throws TenantSlugError si le slug est syntaxiquement invalide
 * @throws TenantNotFoundError si le tenant n'existe pas
 * @throws TenantAccessDeniedError si l'utilisateur n'a pas de membership
 */
export async function resolveTenantContext(
  supabase: SupabaseClient<Database>,
  slug: string,
): Promise<TenantContext> {
  // 1. Validation syntaxique
  if (!validateTenantSlug(slug)) {
    throw new TenantSlugError(slug);
  }

  // 2. Vérifier l'identité via getClaims (valide le JWT côté serveur)
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  if (claimsError !== null || claimsData === null) {
    throw new TenantAccessDeniedError(slug);
  }
  const userId = claimsData.claims.sub;

  // 3. Chercher le tenant (RLS filtre automatiquement selon les memberships)
  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .select("*")
    .eq("slug", slug)
    .single();

  if (tenantError !== null || tenant === null) {
    // Le tenant n'existe pas OU l'utilisateur n'y a pas accès (RLS)
    // Distinguer les deux cas via une requête sans RLS n'est pas possible depuis le client.
    // On retourne NotFound pour ne pas révéler l'existence d'un tenant inaccessible.
    throw new TenantNotFoundError(slug);
  }

  // 4. Récupérer le rôle de l'utilisateur dans ce tenant
  const { data: membership, error: membershipError } = await supabase
    .from("memberships")
    .select("role")
    .eq("tenant_id", tenant.id)
    .eq("user_id", userId)
    .single();

  if (membershipError !== null || membership === null) {
    throw new TenantAccessDeniedError(slug);
  }

  return {
    tenant,
    role: membership.role,
    userId,
  };
}
