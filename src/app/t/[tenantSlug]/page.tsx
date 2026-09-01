/**
 * src/app/t/[tenantSlug]/page.tsx
 * Page d'accueil du tenant — dashboard minimal F1.
 *
 * Dans Next.js 16, params est asynchrone.
 */

interface TenantPageProps {
  params: Promise<{ tenantSlug: string }>;
}

export default async function TenantPage({ params }: TenantPageProps) {
  const { tenantSlug } = await params;

  return (
    <div className="vlz-tenant-dashboard">
      <h1>Espace {tenantSlug}</h1>
      <p>
        Bienvenue dans votre espace VERALUZ. Les modules métier arrivent dans les lots suivants.
      </p>
    </div>
  );
}
