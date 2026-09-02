/**
 * src/app/t/[tenantSlug]/modules/[moduleSlug]/page.tsx
 * Placeholder honnête pour les domaines de ROADMAP.md non couverts par UI-1.
 *
 * Dans Next.js 16, params est asynchrone.
 */

import { notFound } from "next/navigation";
import { getTenantContext } from "@/lib/tenant-context";
import { findFutureModule } from "@/components/shell/navigation";
import { ComingSoon } from "@/components/ui/coming-soon";

interface ModulePlaceholderPageProps {
  params: Promise<{ tenantSlug: string; moduleSlug: string }>;
}

export default async function ModulePlaceholderPage({ params }: ModulePlaceholderPageProps) {
  const { tenantSlug, moduleSlug } = await params;
  await getTenantContext(tenantSlug);

  const futureModule = findFutureModule(moduleSlug);
  if (futureModule === undefined) {
    notFound();
  }

  return (
    <ComingSoon
      title={futureModule.label}
      description={futureModule.description}
      lot={futureModule.lot}
    />
  );
}
