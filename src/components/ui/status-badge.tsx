/**
 * src/components/ui/status-badge.tsx
 * Badges de statut — jamais de communication par la couleur seule (texte explicite).
 */

import type { RoomOperationalStatus } from "@/modules/rooms/domain/types";

const OPERATIONAL_STATUS_LABEL: Record<RoomOperationalStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  out_of_service: "Hors service",
};

const OPERATIONAL_STATUS_CLASS: Record<RoomOperationalStatus, string> = {
  active: "vlz-badge-success",
  inactive: "vlz-badge-neutral",
  out_of_service: "vlz-badge-error",
};

export function RoomStatusBadge({ status }: { status: RoomOperationalStatus }): React.JSX.Element {
  return (
    <span className={`vlz-badge ${OPERATIONAL_STATUS_CLASS[status]}`}>
      {OPERATIONAL_STATUS_LABEL[status]}
    </span>
  );
}

export function ActiveBadge({ isActive }: { isActive: boolean }): React.JSX.Element {
  return (
    <span className={`vlz-badge ${isActive ? "vlz-badge-success" : "vlz-badge-neutral"}`}>
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}
