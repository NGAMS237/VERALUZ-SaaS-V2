/**
 * src/app/t/[tenantSlug]/layout.tsx
 * Shell protégé du tenant — résolution et vérification d'accès côté serveur.
 *
 * Dans Next.js 16, params est asynchrone.
 */

import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTenantContext } from "@/lib/tenant-context";
import {
  TenantNotFoundError,
  TenantAccessDeniedError,
  TenantSlugError,
} from "@/modules/tenant/resolver";
import { listAccessibleTenants } from "@/modules/tenant/queries";
import { AppShell } from "@/components/shell/app-shell";
import type { TenantOption } from "@/components/shell/tenant-switcher";

interface TenantLayoutProps {
  children: React.ReactNode;
  params: Promise<{ tenantSlug: string }>;
}

export default async function TenantLayout({ children, params }: TenantLayoutProps) {
  const { tenantSlug } = await params;

  let context;
  try {
    context = await getTenantContext(tenantSlug);
  } catch (error) {
    if (error instanceof TenantSlugError || error instanceof TenantNotFoundError) {
      notFound();
    }
    if (error instanceof TenantAccessDeniedError) {
      redirect(`/login?redirectTo=/t/${tenantSlug}/dashboard`);
    }
    throw error;
  }

  const { tenant, role, userId } = context;

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const userEmail = userData.user?.email ?? "";

  const accessible = await listAccessibleTenants(supabase, userId);
  const tenantOptions: TenantOption[] = accessible.map((entry) => ({
    slug: entry.tenant.slug,
    name: entry.tenant.name,
    role: entry.role,
  }));

  return (
    <AppShell
      tenantSlug={tenant.slug}
      tenantName={tenant.name}
      userEmail={userEmail}
      role={role}
      tenantOptions={tenantOptions}
    >
      {children}
    </AppShell>
  );
}
