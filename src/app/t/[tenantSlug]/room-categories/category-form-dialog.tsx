"use client";

/**
 * src/app/t/[tenantSlug]/room-categories/category-form-dialog.tsx
 * Formulaire de création/modification d'une catégorie de chambres.
 */

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Modal } from "@/components/ui/modal";
import type { RoomCategory } from "@/modules/rooms/domain/types";
import { createRoomCategoryAction, updateRoomCategoryAction } from "./actions";
import { initialActionResult } from "../action-result";

interface CategoryFormDialogProps {
  tenantSlug: string;
  category: RoomCategory | null;
  onClose: () => void;
}

function SubmitButton({ label }: { label: string }): React.JSX.Element {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="vlz-btn vlz-btn-primary"
      disabled={pending}
      aria-disabled={pending}
    >
      {pending ? "Enregistrement…" : label}
    </button>
  );
}

export function CategoryFormDialog({
  tenantSlug,
  category,
  onClose,
}: CategoryFormDialogProps): React.JSX.Element {
  const isEdit = category !== null;
  const action = isEdit
    ? updateRoomCategoryAction.bind(null, tenantSlug, category.id)
    : createRoomCategoryAction.bind(null, tenantSlug);
  const [state, formAction] = useActionState(action, initialActionResult);

  useEffect(() => {
    if (state.status === "success") onClose();
  }, [state.status, onClose]);

  const errors = state.fieldErrors ?? {};

  return (
    <Modal title={isEdit ? "Modifier la catégorie" : "Nouvelle catégorie"} onClose={onClose}>
      <form action={formAction} className="vlz-login-form" noValidate>
        {state.status === "error" && state.message !== undefined && (
          <div className="vlz-login-error" role="alert">
            {state.message}
          </div>
        )}

        {!isEdit && (
          <div className="vlz-form-group">
            <label htmlFor="code" className="vlz-label vlz-label-required">
              Code
            </label>
            <input
              id="code"
              name="code"
              className="vlz-input"
              required
              maxLength={32}
              placeholder="STD, SUP, SUITE…"
              aria-invalid={errors["code"] !== undefined}
            />
            {errors["code"] !== undefined && <p className="vlz-field-error">{errors["code"]}</p>}
          </div>
        )}

        <div className="vlz-form-group">
          <label htmlFor="name" className="vlz-label vlz-label-required">
            Nom
          </label>
          <input
            id="name"
            name="name"
            className="vlz-input"
            required
            maxLength={100}
            defaultValue={category?.name ?? ""}
            aria-invalid={errors["name"] !== undefined}
          />
          {errors["name"] !== undefined && <p className="vlz-field-error">{errors["name"]}</p>}
        </div>

        <div className="vlz-form-group">
          <label htmlFor="description" className="vlz-label">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            className="vlz-textarea"
            maxLength={500}
            defaultValue={category?.description ?? ""}
          />
        </div>

        <div className="vlz-form-grid">
          <div className="vlz-form-group">
            <label htmlFor="baseOccupancy" className="vlz-label vlz-label-required">
              Occupation de base
            </label>
            <input
              id="baseOccupancy"
              name="baseOccupancy"
              type="number"
              min={1}
              className="vlz-input"
              required
              defaultValue={category?.baseOccupancy ?? 1}
              aria-invalid={errors["baseOccupancy"] !== undefined}
            />
            {errors["baseOccupancy"] !== undefined && (
              <p className="vlz-field-error">{errors["baseOccupancy"]}</p>
            )}
          </div>
          <div className="vlz-form-group">
            <label htmlFor="maxOccupancy" className="vlz-label vlz-label-required">
              Occupation maximale
            </label>
            <input
              id="maxOccupancy"
              name="maxOccupancy"
              type="number"
              min={1}
              className="vlz-input"
              required
              defaultValue={category?.maxOccupancy ?? 1}
              aria-invalid={errors["maxOccupancy"] !== undefined}
            />
            {errors["maxOccupancy"] !== undefined && (
              <p className="vlz-field-error">{errors["maxOccupancy"]}</p>
            )}
          </div>
          <div className="vlz-form-group">
            <label htmlFor="maxAdults" className="vlz-label vlz-label-required">
              Adultes max.
            </label>
            <input
              id="maxAdults"
              name="maxAdults"
              type="number"
              min={0}
              className="vlz-input"
              required
              defaultValue={category?.maxAdults ?? 1}
              aria-invalid={errors["maxAdults"] !== undefined}
            />
            {errors["maxAdults"] !== undefined && (
              <p className="vlz-field-error">{errors["maxAdults"]}</p>
            )}
          </div>
          <div className="vlz-form-group">
            <label htmlFor="maxChildren" className="vlz-label vlz-label-required">
              Enfants max.
            </label>
            <input
              id="maxChildren"
              name="maxChildren"
              type="number"
              min={0}
              className="vlz-input"
              required
              defaultValue={category?.maxChildren ?? 0}
              aria-invalid={errors["maxChildren"] !== undefined}
            />
            {errors["maxChildren"] !== undefined && (
              <p className="vlz-field-error">{errors["maxChildren"]}</p>
            )}
          </div>
        </div>

        <div className="vlz-form-actions">
          <SubmitButton label={isEdit ? "Enregistrer" : "Créer la catégorie"} />
          <button type="button" className="vlz-btn vlz-btn-ghost" onClick={onClose}>
            Annuler
          </button>
        </div>
      </form>
    </Modal>
  );
}
