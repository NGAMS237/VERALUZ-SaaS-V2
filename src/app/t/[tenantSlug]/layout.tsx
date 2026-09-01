/**
 * src/app/t/[tenantSlug]/layout.tsx
 * Shell protégé du tenant — résolution et vérification d'accès côté serveur.
 *
 * Dans Next.js 16, params est asynchrone.
 */

import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  resolveTenantContext,
  TenantNotFoundError,
  TenantAccessDeniedError,
  TenantSlugError,
} from "@/modules/tenant/resolver";

interface TenantLayoutProps {
  children: React.ReactNode;
  params: Promise<{ tenantSlug: string }>;
}

export default async function TenantLayout({ children, params }: TenantLayoutProps) {
  const { tenantSlug } = await params;
  const supabase = await createClient();

  let context;
  try {
    context = await resolveTenantContext(supabase, tenantSlug);
  } catch (error) {
    if (error instanceof TenantSlugError || error instanceof TenantNotFoundError) {
      notFound();
    }
    if (error instanceof TenantAccessDeniedError) {
      redirect("/login");
    }
    throw error;
  }

  const { tenant, role } = context;

  return (
    <div className="vlz-tenant-shell">
      <header className="vlz-tenant-header">
        <span className="vlz-tenant-name">{tenant.name}</span>
        <span className="vlz-tenant-role">{role}</span>
        <form action="/api/kjemo/v1/auth/logout" method="POST">
          <button type="submit" className="vlz-btn-logout">
            Déconnexion
          </button>
        </form>
      </header>
      <main className="vlz-tenant-content">{children}</main>
    </div>
  );
}
