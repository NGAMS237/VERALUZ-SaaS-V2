/**
 * src/modules/tenant/queries.ts
 * Requêtes de lecture liées aux tenants accessibles par l'utilisateur courant.
 *
 * Séparé de resolver.ts (résolution d'accès à un tenant précis) : ce module
 * liste les tenants dont l'utilisateur est membre, pour le sélecteur tenant du shell.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Tenant, MembershipRole } from "@/lib/database.types";

export interface AccessibleTenant {
  tenant: Tenant;
  role: MembershipRole;
}

/**
 * Liste les tenants accessibles à l'utilisateur authentifié (via ses memberships).
 * RLS filtre automatiquement : seules les lignes de l'utilisateur courant sont visibles.
 *
 * Deux requêtes simples plutôt qu'un embed imbriqué : plus robuste au typage
 * généré et suffisant pour le nombre de tenants d'un utilisateur (petit N).
 */
export async function listAccessibleTenants(
  client: SupabaseClient<Database>,
  userId: string,
): Promise<AccessibleTenant[]> {
  const { data: memberships, error: membershipsError } = await client
    .from("memberships")
    .select("tenant_id, role")
    .eq("user_id", userId);

  if (membershipsError !== null || memberships === null || memberships.length === 0) {
    return [];
  }

  const roleByTenantId = new Map<string, MembershipRole>(
    memberships.map((m) => [m.tenant_id, m.role]),
  );

  const { data: tenants, error: tenantsError } = await client
    .from("tenants")
    .select("*")
    .in("id", [...roleByTenantId.keys()]);

  if (tenantsError !== null || tenants === null) {
    return [];
  }

  return tenants
    .map((tenant) => {
      const role = roleByTenantId.get(tenant.id);
      return role !== undefined ? { tenant, role } : null;
    })
    .filter((entry): entry is AccessibleTenant => entry !== null)
    .sort((a, b) => a.tenant.name.localeCompare(b.tenant.name));
}
