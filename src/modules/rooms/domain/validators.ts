/**
 * src/modules/rooms/domain/validators.ts
 * Validateurs Zod — Catégories de chambres et Chambres.
 */

import { z } from "zod";
import { ROOM_OPERATIONAL_STATUSES } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Primitives
// ─────────────────────────────────────────────────────────────────────────────

/** Code catégorie : A-Z0-9 + tirets/underscores, 1-32 chars, normalisé en UPPERCASE */
export const roomCategoryCodeSchema = z
  .string()
  .min(1, "Le code est obligatoire")
  .max(32, "Le code ne doit pas dépasser 32 caractères")
  .transform((v) => v.trim().toUpperCase())
  .refine((v) => /^[A-Z0-9][A-Z0-9_-]{0,31}$/.test(v), {
    message: "Le code doit être alphanumérique (A-Z, 0-9, _, -)",
  });

/** Code chambre : alphanumérique + tirets/underscores, 1-32 chars */
export const roomCodeSchema = z
  .string()
  .min(1, "Le code chambre est obligatoire")
  .max(32, "Le code chambre ne doit pas dépasser 32 caractères")
  .transform((v) => v.trim())
  .refine((v) => /^[A-Za-z0-9][A-Za-z0-9_-]{0,31}$/.test(v), {
    message: "Le code chambre doit commencer par un caractère alphanumérique",
  });

const positiveInt = z.number().int().min(1);
const nonNegInt = z.number().int().min(0);

// ─────────────────────────────────────────────────────────────────────────────
// RoomCategory
// ─────────────────────────────────────────────────────────────────────────────

const occupancyBase = z.object({
  baseOccupancy: positiveInt,
  maxAdults: nonNegInt,
  maxChildren: nonNegInt,
  maxOccupancy: positiveInt,
});

const _occupancyRefinement = occupancyBase.refine(
  (d) => d.maxOccupancy >= d.baseOccupancy && d.maxAdults <= d.maxOccupancy,
  {
    message: "max_occupancy doit être >= base_occupancy, et max_adults <= max_occupancy",
    path: ["maxOccupancy"],
  },
);

export const createRoomCategorySchema = z
  .object({
    code: roomCategoryCodeSchema,
    name: z.string().min(1, "Le nom est obligatoire").max(100).trim(),
    description: z.string().max(500).trim().optional(),
  })
  .merge(occupancyBase)
  .superRefine((d, ctx) => {
    if (d.maxOccupancy < d.baseOccupancy) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "max_occupancy doit être >= base_occupancy",
        path: ["maxOccupancy"],
      });
    }
    if (d.maxAdults > d.maxOccupancy) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "max_adults doit être <= max_occupancy",
        path: ["maxAdults"],
      });
    }
  });

export const updateRoomCategorySchema = z
  .object({
    name: z.string().min(1).max(100).trim().optional(),
    description: z.string().max(500).trim().optional(),
    baseOccupancy: positiveInt.optional(),
    maxAdults: nonNegInt.optional(),
    maxChildren: nonNegInt.optional(),
    maxOccupancy: positiveInt.optional(),
  })
  .strict();

export const setRoomCategoryActiveSchema = z.object({
  isActive: z.boolean(),
});

// ─────────────────────────────────────────────────────────────────────────────
// Room
// ─────────────────────────────────────────────────────────────────────────────

export const roomOperationalStatusSchema = z.enum(
  ROOM_OPERATIONAL_STATUSES as unknown as [string, ...string[]],
);

export const createRoomSchema = z.object({
  roomCategoryId: z.string().uuid("roomCategoryId doit être un UUID valide"),
  code: roomCodeSchema,
  name: z.string().min(1).max(100).trim().optional(),
  floor: z.string().max(10).trim().optional(),
  description: z.string().max(500).trim().optional(),
  operationalStatus: roomOperationalStatusSchema.optional().default("active"),
});

export const updateRoomSchema = z
  .object({
    roomCategoryId: z.string().uuid().optional(),
    name: z.string().min(1).max(100).trim().optional(),
    floor: z.string().max(10).trim().optional(),
    description: z.string().max(500).trim().optional(),
  })
  .strict();

export const setRoomStatusSchema = z.object({
  operationalStatus: roomOperationalStatusSchema,
  isActive: z.boolean().optional(),
});
