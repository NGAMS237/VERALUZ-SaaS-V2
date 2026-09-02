/**
 * src/modules/settings/domain/validators.ts
 * Validateurs Zod — Paramètres opérationnels tenant.
 */

import { z } from "zod";

/** HH:MM format */
const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "L'heure doit être au format HH:MM (ex: 12:00)");

export const updateTenantSettingsSchema = z
  .object({
    timezone: z.string().min(1).max(64).trim().optional(),
    currencyCode: z
      .string()
      .regex(/^[A-Z]{3}$/, "Le code devise doit être en format ISO 4217 (ex: XAF)")
      .optional(),
    locale: z
      .string()
      .regex(/^[a-z]{2}-[A-Z]{2}$/, "La locale doit être au format xx-XX (ex: fr-CM)")
      .optional(),
    checkInTime: timeSchema.nullable().optional(),
    checkOutTime: timeSchema.optional(),
  })
  .strict();
