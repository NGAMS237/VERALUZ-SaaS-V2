/**
 * src/app/t/[tenantSlug]/not-found.tsx
 * Tenant inexistant ou slug invalide — message honnête, sans révéler
 * si le tenant existe pour un autre utilisateur.
 */

import Link from "next/link";

export default function TenantNotFound(): React.JSX.Element {
  return (
    <div className="vlz-login-container">
      <div className="vlz-login-card">
        <h1 className="vlz-login-title">Établissement introuvable</h1>
        <p className="vlz-login-subtitle">
          Cet établissement n&apos;existe pas ou vous n&apos;y avez pas accès.
        </p>
        <div className="vlz-login-form">
          <Link href="/login" className="vlz-btn vlz-btn-primary">
            Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
}
