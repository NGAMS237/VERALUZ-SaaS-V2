"use client";

/**
 * src/app/t/[tenantSlug]/rooms/room-form-dialog.tsx
 * Formulaire de création/modification d'une chambre.
 */

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Modal } from "@/components/ui/modal";
import type { Room } from "@/modules/rooms/domain/types";
import type { RoomCategory } from "@/modules/rooms/domain/types";
import { createRoomAction, updateRoomAction } from "./actions";
import { initialActionResult } from "../action-result";

interface RoomFormDialogProps {
  tenantSlug: string;
  room: Room | null;
  categories: RoomCategory[];
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

export function RoomFormDialog({
  tenantSlug,
  room,
  categories,
  onClose,
}: RoomFormDialogProps): React.JSX.Element {
  const isEdit = room !== null;
  const action = isEdit
    ? updateRoomAction.bind(null, tenantSlug, room.id)
    : createRoomAction.bind(null, tenantSlug);
  const [state, formAction] = useActionState(action, initialActionResult);

  useEffect(() => {
    if (state.status === "success") onClose();
  }, [state.status, onClose]);

  const errors = state.fieldErrors ?? {};

  return (
    <Modal title={isEdit ? "Modifier la chambre" : "Nouvelle chambre"} onClose={onClose}>
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
              placeholder="101, 102, SUITE-301…"
              aria-invalid={errors["code"] !== undefined}
            />
            {errors["code"] !== undefined && <p className="vlz-field-error">{errors["code"]}</p>}
          </div>
        )}

        <div className="vlz-form-group">
          <label htmlFor="roomCategoryId" className="vlz-label vlz-label-required">
            Catégorie
          </label>
          <select
            id="roomCategoryId"
            name="roomCategoryId"
            className="vlz-select"
            required
            defaultValue={room?.roomCategoryId ?? ""}
            aria-invalid={errors["roomCategoryId"] !== undefined}
          >
            <option value="" disabled>
              Sélectionner une catégorie
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.code} — {category.name}
              </option>
            ))}
          </select>
          {errors["roomCategoryId"] !== undefined && (
            <p className="vlz-field-error">{errors["roomCategoryId"]}</p>
          )}
        </div>

        <div className="vlz-form-grid">
          <div className="vlz-form-group">
            <label htmlFor="name" className="vlz-label">
              Nom
            </label>
            <input
              id="name"
              name="name"
              className="vlz-input"
              maxLength={100}
              defaultValue={room?.name ?? ""}
            />
          </div>
          <div className="vlz-form-group">
            <label htmlFor="floor" className="vlz-label">
              Étage
            </label>
            <input
              id="floor"
              name="floor"
              className="vlz-input"
              maxLength={10}
              defaultValue={room?.floor ?? ""}
            />
          </div>
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
            defaultValue={room?.description ?? ""}
          />
        </div>

        {!isEdit && (
          <div className="vlz-form-group">
            <label htmlFor="operationalStatus" className="vlz-label">
              Statut initial
            </label>
            <select
              id="operationalStatus"
              name="operationalStatus"
              className="vlz-select"
              defaultValue="active"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="out_of_service">Hors service</option>
            </select>
          </div>
        )}

        <div className="vlz-form-actions">
          <SubmitButton label={isEdit ? "Enregistrer" : "Créer la chambre"} />
          <button type="button" className="vlz-btn vlz-btn-ghost" onClick={onClose}>
            Annuler
          </button>
        </div>
      </form>
    </Modal>
  );
}
