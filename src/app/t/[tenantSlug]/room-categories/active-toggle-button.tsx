"use client";

/**
 * src/app/t/[tenantSlug]/room-categories/active-toggle-button.tsx
 * Bouton d'activation/désactivation d'une catégorie — protégé contre le double-clic.
 */

import { useState, useTransition } from "react";
import { setRoomCategoryActiveAction } from "./actions";

interface ActiveToggleButtonProps {
  tenantSlug: string;
  categoryId: string;
  isActive: boolean;
}

export function ActiveToggleButton({
  tenantSlug,
  categoryId,
  isActive,
}: ActiveToggleButtonProps): React.JSX.Element {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function toggle(): void {
    setError(null);
    startTransition(async () => {
      const result = await setRoomCategoryActiveAction(tenantSlug, categoryId, !isActive);
      if (result.status === "error") {
        setError(result.message ?? "Une erreur est survenue.");
      }
    });
  }

  return (
    <div>
      <button
        type="button"
        className={`vlz-btn vlz-btn-sm ${isActive ? "vlz-btn-danger" : "vlz-btn-secondary"}`}
        onClick={toggle}
        disabled={isPending}
        aria-disabled={isPending}
      >
        {isPending ? "…" : isActive ? "Désactiver" : "Activer"}
      </button>
      {error !== null && <p className="vlz-field-error">{error}</p>}
    </div>
  );
}
