"use client";

/**
 * src/app/t/[tenantSlug]/error.tsx
 * Erreur inattendue (serveur, réseau) — message honnête, sans détail technique.
 */

import { useEffect } from "react";

interface TenantErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function TenantError({ error, reset }: TenantErrorProps): React.JSX.Element {
  useEffect(() => {
    console.error("[UI] Erreur segment tenant:", error);
  }, [error]);

  return (
    <div className="vlz-login-container">
      <div className="vlz-login-card">
        <h1 className="vlz-login-title">Une erreur est survenue</h1>
        <p className="vlz-login-subtitle">
          Le service est momentanément indisponible. Merci de réessayer dans un instant.
        </p>
        <div className="vlz-login-form">
          <button type="button" className="vlz-btn vlz-btn-primary" onClick={reset}>
            Réessayer
          </button>
        </div>
      </div>
    </div>
  );
}
