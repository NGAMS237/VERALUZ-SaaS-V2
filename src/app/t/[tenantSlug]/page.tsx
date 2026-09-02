/**
 * src/app/t/[tenantSlug]/page.tsx
 * Redirection vers le tableau de bord — route canonique.
 *
 * Dans Next.js 16, params est asynchrone.
 */

import { redirect } from "next/navigation";

interface TenantPageProps {
  params: Promise<{ tenantSlug: string }>;
}

export default async function TenantPage({ params }: TenantPageProps) {
  const { tenantSlug } = await params;
  redirect(`/t/${tenantSlug}/dashboard`);
}
