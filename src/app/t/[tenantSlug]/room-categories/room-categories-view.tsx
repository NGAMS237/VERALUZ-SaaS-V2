"use client";

/**
 * src/app/t/[tenantSlug]/room-categories/room-categories-view.tsx
 * Vue interactive — table des catégories, création, modification, activation.
 */

import { useState } from "react";
import type { RoomCategory } from "@/modules/rooms/domain/types";
import { ActiveBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { IconPlus } from "@/components/ui/icons";
import { CategoryFormDialog } from "./category-form-dialog";
import { ActiveToggleButton } from "./active-toggle-button";

interface RoomCategoriesViewProps {
  tenantSlug: string;
  categories: RoomCategory[];
  canWrite: boolean;
  activeFilter: "all" | "active" | "inactive";
}

export function RoomCategoriesView({
  tenantSlug,
  categories,
  canWrite,
  activeFilter,
}: RoomCategoriesViewProps): React.JSX.Element {
  const [dialogState, setDialogState] = useState<
    { mode: "create" } | { mode: "edit"; category: RoomCategory } | null
  >(null);

  return (
    <>
      <div className="vlz-page-header">
        <div>
          <h1 className="vlz-page-title">Catégories de chambres</h1>
          <p className="vlz-page-subtitle">
            {categories.length} catégorie{categories.length > 1 ? "s" : ""}
          </p>
        </div>
        {canWrite && (
          <button
            type="button"
            className="vlz-btn vlz-btn-accent"
            onClick={() => setDialogState({ mode: "create" })}
          >
            <IconPlus aria-hidden />
            Nouvelle catégorie
          </button>
        )}
      </div>

      <form method="get" className="vlz-filter-bar">
        <div className="vlz-filter-field">
          <label htmlFor="active" className="vlz-label">
            Statut
          </label>
          <select id="active" name="active" className="vlz-select" defaultValue={activeFilter}>
            <option value="all">Toutes</option>
            <option value="active">Actives uniquement</option>
            <option value="inactive">Inactives uniquement</option>
          </select>
        </div>
        <button type="submit" className="vlz-btn vlz-btn-secondary">
          Filtrer
        </button>
      </form>

      {categories.length === 0 ? (
        <EmptyState
          title="Aucune catégorie"
          description={
            activeFilter === "all"
              ? "Aucune catégorie de chambres n'a encore été créée pour cet établissement."
              : "Aucune catégorie ne correspond à ce filtre."
          }
          action={
            canWrite && activeFilter === "all" ? (
              <button
                type="button"
                className="vlz-btn vlz-btn-primary"
                onClick={() => setDialogState({ mode: "create" })}
              >
                Créer la première catégorie
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
                  <th className="vlz-table-numeric">Base</th>
                  <th className="vlz-table-numeric">Max. adultes</th>
                  <th className="vlz-table-numeric">Max. enfants</th>
                  <th className="vlz-table-numeric">Max. total</th>
                  <th>Statut</th>
                  {canWrite && <th aria-label="Actions" />}
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td className="vlz-table-cell-primary">{category.code}</td>
                    <td>{category.name}</td>
                    <td className="vlz-table-numeric">{category.baseOccupancy}</td>
                    <td className="vlz-table-numeric">{category.maxAdults}</td>
                    <td className="vlz-table-numeric">{category.maxChildren}</td>
                    <td className="vlz-table-numeric">{category.maxOccupancy}</td>
                    <td>
                      <ActiveBadge isActive={category.isActive} />
                    </td>
                    {canWrite && (
                      <td>
                        <div className="vlz-table-actions">
                          <button
                            type="button"
                            className="vlz-btn vlz-btn-sm vlz-btn-secondary"
                            onClick={() => setDialogState({ mode: "edit", category })}
                          >
                            Modifier
                          </button>
                          <ActiveToggleButton
                            tenantSlug={tenantSlug}
                            categoryId={category.id}
                            isActive={category.isActive}
                          />
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="vlz-record-cards">
            {categories.map((category) => (
              <div className="vlz-record-card" key={category.id}>
                <div className="vlz-record-card-header">
                  <span className="vlz-record-card-title">
                    {category.code} — {category.name}
                  </span>
                  <ActiveBadge isActive={category.isActive} />
                </div>
                <div className="vlz-record-card-row">
                  <span>Occupation</span>
                  <span>
                    {category.baseOccupancy} base · {category.maxOccupancy} max (
                    {category.maxAdults} ad. / {category.maxChildren} enf.)
                  </span>
                </div>
                {canWrite && (
                  <div className="vlz-table-actions">
                    <button
                      type="button"
                      className="vlz-btn vlz-btn-sm vlz-btn-secondary"
                      onClick={() => setDialogState({ mode: "edit", category })}
                    >
                      Modifier
                    </button>
                    <ActiveToggleButton
                      tenantSlug={tenantSlug}
                      categoryId={category.id}
                      isActive={category.isActive}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {dialogState !== null && (
        <CategoryFormDialog
          tenantSlug={tenantSlug}
          category={dialogState.mode === "edit" ? dialogState.category : null}
          onClose={() => setDialogState(null)}
        />
      )}
    </>
  );
}
