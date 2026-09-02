"use client";

/**
 * src/app/t/[tenantSlug]/settings/settings-view.tsx
 * Paramètres opérationnels — fuseau horaire, devise, locale, heures d'arrivée/départ.
 */

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { TenantOperationalSettings } from "@/modules/settings/domain/types";
import { updateSettingsAction } from "./actions";
import { initialActionResult } from "../action-result";

interface SettingsViewProps {
  tenantSlug: string;
  settings: TenantOperationalSettings;
  canWrite: boolean;
}

function SubmitButton(): React.JSX.Element {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="vlz-btn vlz-btn-primary"
      disabled={pending}
      aria-disabled={pending}
    >
      {pending ? "Enregistrement…" : "Enregistrer"}
    </button>
  );
}

export function SettingsView({
  tenantSlug,
  settings,
  canWrite,
}: SettingsViewProps): React.JSX.Element {
  const action = updateSettingsAction.bind(null, tenantSlug);
  const [state, formAction] = useActionState(action, initialActionResult);
  const errors = state.fieldErrors ?? {};

  return (
    <>
      <div className="vlz-page-header">
        <div>
          <h1 className="vlz-page-title">Paramètres opérationnels</h1>
          <p className="vlz-page-subtitle">
            Fuseau horaire, devise, locale et heures de référence.
          </p>
        </div>
      </div>

      <div className="vlz-card vlz-card-padded">
        <form action={formAction} className="vlz-login-form" noValidate>
          {state.status === "error" && state.message !== undefined && (
            <div className="vlz-login-error" role="alert">
              {state.message}
            </div>
          )}
          {state.status === "success" && state.message !== undefined && (
            <div className="vlz-alert vlz-alert-success" role="status">
              {state.message}
            </div>
          )}

          <div className="vlz-form-grid">
            <div className="vlz-form-group">
              <label htmlFor="timezone" className="vlz-label vlz-label-required">
                Fuseau horaire
              </label>
              <input
                id="timezone"
                name="timezone"
                className="vlz-input"
                required
                defaultValue={settings.timezone}
                disabled={!canWrite}
                placeholder="Africa/Douala"
                aria-invalid={errors["timezone"] !== undefined}
              />
              {errors["timezone"] !== undefined && (
                <p className="vlz-field-error">{errors["timezone"]}</p>
              )}
            </div>

            <div className="vlz-form-group">
              <label htmlFor="currencyCode" className="vlz-label vlz-label-required">
                Devise (ISO 4217)
              </label>
              <input
                id="currencyCode"
                name="currencyCode"
                className="vlz-input"
                required
                maxLength={3}
                defaultValue={settings.currencyCode}
                disabled={!canWrite}
                placeholder="XAF"
                aria-invalid={errors["currencyCode"] !== undefined}
              />
              {errors["currencyCode"] !== undefined && (
                <p className="vlz-field-error">{errors["currencyCode"]}</p>
              )}
            </div>

            <div className="vlz-form-group">
              <label htmlFor="locale" className="vlz-label vlz-label-required">
                Locale
              </label>
              <input
                id="locale"
                name="locale"
                className="vlz-input"
                required
                defaultValue={settings.locale}
                disabled={!canWrite}
                placeholder="fr-CM"
                aria-invalid={errors["locale"] !== undefined}
              />
              {errors["locale"] !== undefined && (
                <p className="vlz-field-error">{errors["locale"]}</p>
              )}
            </div>

            <div className="vlz-form-group">
              <label htmlFor="checkInTime" className="vlz-label">
                Heure d&apos;arrivée (check-in)
              </label>
              <input
                id="checkInTime"
                name="checkInTime"
                type="time"
                className="vlz-input"
                defaultValue={settings.checkInTime ?? ""}
                disabled={!canWrite}
                aria-invalid={errors["checkInTime"] !== undefined}
              />
              {errors["checkInTime"] !== undefined && (
                <p className="vlz-field-error">{errors["checkInTime"]}</p>
              )}
            </div>

            <div className="vlz-form-group">
              <label htmlFor="checkOutTime" className="vlz-label vlz-label-required">
                Heure de départ (check-out)
              </label>
              <input
                id="checkOutTime"
                name="checkOutTime"
                type="time"
                className="vlz-input"
                required
                defaultValue={settings.checkOutTime}
                disabled={!canWrite}
                aria-invalid={errors["checkOutTime"] !== undefined}
              />
              {errors["checkOutTime"] !== undefined && (
                <p className="vlz-field-error">{errors["checkOutTime"]}</p>
              )}
              <p className="vlz-helper-text">Référence métier : 12:00.</p>
            </div>
          </div>

          {canWrite ? (
            <div className="vlz-form-actions">
              <SubmitButton />
            </div>
          ) : (
            <p className="vlz-helper-text">
              Votre rôle ne permet que la consultation de ces paramètres.
            </p>
          )}
        </form>
      </div>
    </>
  );
}
