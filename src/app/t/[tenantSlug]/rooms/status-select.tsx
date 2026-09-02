"use client";

/**
 * src/app/t/[tenantSlug]/rooms/status-select.tsx
 * Changement du statut opérationnel d'une chambre — protégé contre le double-clic.
 */

import { useState, useTransition } from "react";
import type { RoomOperationalStatus } from "@/modules/rooms/domain/types";
import { setRoomStatusAction } from "./actions";

const STATUS_LABELS: Record<RoomOperationalStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  out_of_service: "Hors service",
};

interface StatusSelectProps {
  tenantSlug: string;
  roomId: string;
  status: RoomOperationalStatus;
}

export function StatusSelect({ tenantSlug, roomId, status }: StatusSelectProps): React.JSX.Element {
  const [value, setValue] = useState<RoomOperationalStatus>(status);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onChange(next: RoomOperationalStatus): void {
    setValue(next);
    setError(null);
    startTransition(async () => {
      const result = await setRoomStatusAction(tenantSlug, roomId, next);
      if (result.status === "error") {
        setError(result.message ?? "Une erreur est survenue.");
        setValue(status);
      }
    });
  }

  return (
    <div>
      <select
        className="vlz-select"
        value={value}
        disabled={isPending}
        onChange={(e) => onChange(e.target.value as RoomOperationalStatus)}
        aria-label="Statut opérationnel"
      >
        {(Object.keys(STATUS_LABELS) as RoomOperationalStatus[]).map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s]}
          </option>
        ))}
      </select>
      {error !== null && <p className="vlz-field-error">{error}</p>}
    </div>
  );
}
