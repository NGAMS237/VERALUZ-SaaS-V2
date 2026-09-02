"use server";

/**
 * src/app/t/[tenantSlug]/settings/actions.ts
 * Server Action — mise à jour des paramètres opérationnels du tenant.
 */

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getTenantContext, canWrite } from "@/lib/tenant-context";
import * as svc from "@/modules/settings/services/tenant-settings.service";
import { updateTenantSettingsSchema } from "@/modules/settings/domain/validators";
import type { UpdateTenantSettingsCommand } from "@/modules/settings/domain/types";
import type { ActionResult } from "../action-result";

function zodFieldErrors(err: ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && out[key] === undefined) out[key] = issue.message;
  }
  return out;
}

function readOptionalText(formData: FormData, field: string): string | undefined {
  const raw = formData.get(field);
  return typeof raw === "string" && raw.trim() !== "" ? raw : undefined;
}

export async function updateSettingsAction(
  tenantSlug: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const { tenant, role } = await getTenantContext(tenantSlug);
    if (!canWrite(role)) {
      return {
        status: "error",
        message: "Vous n'avez pas les droits pour modifier les paramètres.",
      };
    }

    const checkInTimeRaw = readOptionalText(formData, "checkInTime");
    const parsed = updateTenantSettingsSchema.parse({
      timezone: formData.get("timezone"),
      currencyCode: formData.get("currencyCode"),
      locale: formData.get("locale"),
      checkInTime: checkInTimeRaw ?? null,
      checkOutTime: formData.get("checkOutTime"),
    });

    const supabase = await createClient();
    const cmd: UpdateTenantSettingsCommand = {
      ...(parsed.timezone !== undefined ? { timezone: parsed.timezone } : {}),
      ...(parsed.currencyCode !== undefined ? { currencyCode: parsed.currencyCode } : {}),
      ...(parsed.locale !== undefined ? { locale: parsed.locale } : {}),
      ...(parsed.checkInTime !== undefined ? { checkInTime: parsed.checkInTime } : {}),
      ...(parsed.checkOutTime !== undefined ? { checkOutTime: parsed.checkOutTime } : {}),
    };
    await svc.updateTenantSettings(supabase, tenant.id, cmd);

    revalidatePath(`/t/${tenantSlug}/settings`);
    return { status: "success", message: "Paramètres mis à jour." };
  } catch (err) {
    if (err instanceof ZodError) {
      return {
        status: "error",
        message: "Veuillez corriger les champs en erreur.",
        fieldErrors: zodFieldErrors(err),
      };
    }
    console.error("[UI] updateSettingsAction:", err);
    return { status: "error", message: "Une erreur est survenue. Réessayez." };
  }
}
