"use client";

/**
 * src/app/t/[tenantSlug]/rooms/rooms-view.tsx
 * Vue interactive — table des chambres, filtres, création, modification, statut.
 */

import { useState } from "react";
import type { Room, RoomCategory } from "@/modules/rooms/domain/types";
import { RoomStatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { IconPlus } from "@/components/ui/icons";
import { RoomFormDialog } from "./room-form-dialog";
import { StatusSelect } from "./status-select";

interface RoomsViewProps {
  tenantSlug: string;
  rooms: Room[];
  categories: RoomCategory[];
  canWrite: boolean;
  filters: { categoryId: string; status: string };
}

function categoryLabel(categories: RoomCategory[], id: string): string {
  const category = categories.find((c) => c.id === id);
  return category !== undefined ? `${category.code} — ${category.name}` : "—";
}

export function RoomsView({
  tenantSlug,
  rooms,
  categories,
  canWrite,
  filters,
}: RoomsViewProps): React.JSX.Element {
  const [dialogState, setDialogState] = useState<
    { mode: "create" } | { mode: "edit"; room: Room } | null
  >(null);
  const hasActiveFilters = filters.categoryId !== "" || filters.status !== "";

  return (
    <>
      <div className="vlz-page-header">
        <div>
          <h1 className="vlz-page-title">Chambres</h1>
          <p className="vlz-page-subtitle">
            {rooms.length} chambre{rooms.length > 1 ? "s" : ""}
          </p>
        </div>
        {canWrite && categories.length > 0 && (
          <button
            type="button"
            className="vlz-btn vlz-btn-accent"
            onClick={() => setDialogState({ mode: "create" })}
          >
            <IconPlus aria-hidden />
            Nouvelle chambre
          </button>
        )}
      </div>

      {categories.length === 0 ? (
        <EmptyState
          title="Aucune catégorie disponible"
          description="Créez d'abord une catégorie de chambres avant d'ajouter une chambre."
        />
      ) : (
        <>
          <form method="get" className="vlz-filter-bar">
            <div className="vlz-filter-field">
              <label htmlFor="categoryId" className="vlz-label">
                Catégorie
              </label>
              <select
                id="categoryId"
                name="categoryId"
                className="vlz-select"
                defaultValue={filters.categoryId}
              >
                <option value="">Toutes</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.code} — {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="vlz-filter-field">
              <label htmlFor="status" className="vlz-label">
                Statut
              </label>
              <select
                id="status"
                name="status"
                className="vlz-select"
                defaultValue={filters.status}
              >
                <option value="">Tous</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="out_of_service">Hors service</option>
              </select>
            </div>
            <button type="submit" className="vlz-btn vlz-btn-secondary">
              Filtrer
            </button>
          </form>

          {rooms.length === 0 ? (
            <EmptyState
              title="Aucune chambre"
              description={
                hasActiveFilters
                  ? "Aucune chambre ne correspond à ces filtres."
                  : "Aucune chambre n'a encore été créée pour cet établissement."
              }
              action={
                canWrite && !hasActiveFilters ? (
                  <button
                    type="button"
                    className="vlz-btn vlz-btn-primary"
                    onClick={() => setDialogState({ mode: "create" })}
                  >
                    Créer la première chambre
                  </button>
                ) : undefined
              }
            />
          ) : (
            <div className="vlz-card">
              <div className="vlz-table-wrapper">
                <table className="vlz-table">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Nom</th>
                      <th>Catégorie</th>
                      <th>Étage</th>
                      <th>Statut</th>
                      {canWrite && <th aria-label="Actions" />}
                    </tr>
                  </thead>
                  <tbody>
                    {rooms.map((room) => (
                      <tr key={room.id}>
                        <td className="vlz-table-cell-primary">{room.code}</td>
                        <td>{room.name ?? "—"}</td>
                        <td>{categoryLabel(categories, room.roomCategoryId)}</td>
                        <td>{room.floor ?? "—"}</td>
                        <td>
                          {canWrite ? (
                            <StatusSelect
                              tenantSlug={tenantSlug}
                              roomId={room.id}
                              status={room.operationalStatus}
                            />
                          ) : (
                            <RoomStatusBadge status={room.operationalStatus} />
                          )}
                        </td>
                        {canWrite && (
                          <td>
                            <div className="vlz-table-actions">
                              <button
                                type="button"
                                className="vlz-btn vlz-btn-sm vlz-btn-secondary"
                                onClick={() => setDialogState({ mode: "edit", room })}
                              >
                                Modifier
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="vlz-record-cards">
                {rooms.map((room) => (
                  <div className="vlz-record-card" key={room.id}>
                    <div className="vlz-record-card-header">
                      <span className="vlz-record-card-title">
                        {room.code}
                        {room.name !== null ? ` — ${room.name}` : ""}
                      </span>
                      <RoomStatusBadge status={room.operationalStatus} />
                    </div>
                    <div className="vlz-record-card-row">
                      <span>Catégorie</span>
                      <span>{categoryLabel(categories, room.roomCategoryId)}</span>
                    </div>
                    <div className="vlz-record-card-row">
                      <span>Étage</span>
                      <span>{room.floor ?? "—"}</span>
                    </div>
                    {canWrite && (
                      <div className="vlz-table-actions">
                        <StatusSelect
                          tenantSlug={tenantSlug}
                          roomId={room.id}
                          status={room.operationalStatus}
                        />
                        <button
                          type="button"
                          className="vlz-btn vlz-btn-sm vlz-btn-secondary"
                          onClick={() => setDialogState({ mode: "edit", room })}
                        >
                          Modifier
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {dialogState !== null && (
        <RoomFormDialog
          tenantSlug={tenantSlug}
          room={dialogState.mode === "edit" ? dialogState.room : null}
          categories={categories}
          onClose={() => setDialogState(null)}
        />
      )}
    </>
  );
}
