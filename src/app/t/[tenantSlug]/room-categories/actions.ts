"use server";

/**
 * src/app/t/[tenantSlug]/room-categories/actions.ts
 * Server Actions — mutations Catégories de chambres.
 *
 * Appelle directement la couche services (même couche que les Route Handlers
 * kjemo/v1) : aucune duplication de logique métier entre API et UI.
 */

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getTenantContext, canWrite } from "@/lib/tenant-context";
import * as svc from "@/modules/rooms/services/room-category.service";
import {
  createRoomCategorySchema,
  updateRoomCategorySchema,
} from "@/modules/rooms/domain/validators";
import type {
  CreateRoomCategoryCommand,
  UpdateRoomCategoryCommand,
} from "@/modules/rooms/domain/types";
import { RoomDomainError } from "@/modules/rooms/domain/types";
import type { ActionResult } from "../action-result";

function zodFieldErrors(err: ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && out[key] === undefined) out[key] = issue.message;
  }
  return out;
}

function friendlyDomainMessage(err: RoomDomainError): string {
  switch (err.code) {
    case "OCCUPANCY_INCOHERENT":
      return "La capacité maximale doit être ≥ à la capacité de base, et le nombre d'adultes maximal ne doit pas dépasser la capacité maximale.";
    case "ROOM_CATEGORY_CODE_CONFLICT":
      return "Ce code de catégorie est déjà utilisé pour cet établissement.";
    case "ROOM_CATEGORY_NOT_FOUND":
      return "Cette catégorie est introuvable.";
    default:
      return "La demande n'a pas pu être traitée.";
  }
}

function readDescription(formData: FormData): string | undefined {
  const raw = formData.get("description");
  return typeof raw === "string" && raw.trim() !== "" ? raw : undefined;
}

function readNumber(formData: FormData, field: string): number {
  const raw = formData.get(field);
  return typeof raw === "string" && raw.trim() !== "" ? Number(raw) : Number.NaN;
}

export async function createRoomCategoryAction(
  tenantSlug: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const { tenant, role } = await getTenantContext(tenantSlug);
    if (!canWrite(role)) {
      return { status: "error", message: "Vous n'avez pas les droits pour créer une catégorie." };
    }

    const description = readDescription(formData);
    const parsed = createRoomCategorySchema.parse({
      code: formData.get("code"),
      name: formData.get("name"),
      ...(description !== undefined ? { description } : {}),
      baseOccupancy: readNumber(formData, "baseOccupancy"),
      maxAdults: readNumber(formData, "maxAdults"),
      maxChildren: readNumber(formData, "maxChildren"),
      maxOccupancy: readNumber(formData, "maxOccupancy"),
    });

    const supabase = await createClient();
    const cmd: CreateRoomCategoryCommand = {
      tenantId: tenant.id,
      code: parsed.code,
      name: parsed.name,
      baseOccupancy: parsed.baseOccupancy,
      maxAdults: parsed.maxAdults,
      maxChildren: parsed.maxChildren,
      maxOccupancy: parsed.maxOccupancy,
      ...(parsed.description !== undefined ? { description: parsed.description } : {}),
    };
    await svc.createRoomCategory(supabase, cmd);

    revalidatePath(`/t/${tenantSlug}/room-categories`);
    revalidatePath(`/t/${tenantSlug}/dashboard`);
    return { status: "success", message: "Catégorie créée." };
  } catch (err) {
    if (err instanceof ZodError) {
      return {
        status: "error",
        message: "Veuillez corriger les champs en erreur.",
        fieldErrors: zodFieldErrors(err),
      };
    }
    if (err instanceof RoomDomainError) {
      return { status: "error", message: friendlyDomainMessage(err) };
    }
    console.error("[UI] createRoomCategoryAction:", err);
    return { status: "error", message: "Une erreur est survenue. Réessayez." };
  }
}

export async function updateRoomCategoryAction(
  tenantSlug: string,
  categoryId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const { tenant, role } = await getTenantContext(tenantSlug);
    if (!canWrite(role)) {
      return {
        status: "error",
        message: "Vous n'avez pas les droits pour modifier cette catégorie.",
      };
    }

    const description = readDescription(formData);
    const parsed = updateRoomCategorySchema.parse({
      name: formData.get("name"),
      ...(description !== undefined ? { description } : {}),
      baseOccupancy: readNumber(formData, "baseOccupancy"),
      maxAdults: readNumber(formData, "maxAdults"),
      maxChildren: readNumber(formData, "maxChildren"),
      maxOccupancy: readNumber(formData, "maxOccupancy"),
    });

    const supabase = await createClient();
    const cmd: UpdateRoomCategoryCommand = {
      ...(parsed.name !== undefined ? { name: parsed.name } : {}),
      ...(parsed.description !== undefined ? { description: parsed.description } : {}),
      ...(parsed.baseOccupancy !== undefined ? { baseOccupancy: parsed.baseOccupancy } : {}),
      ...(parsed.maxAdults !== undefined ? { maxAdults: parsed.maxAdults } : {}),
      ...(parsed.maxChildren !== undefined ? { maxChildren: parsed.maxChildren } : {}),
      ...(parsed.maxOccupancy !== undefined ? { maxOccupancy: parsed.maxOccupancy } : {}),
    };
    await svc.updateRoomCategory(supabase, tenant.id, categoryId, cmd);

    revalidatePath(`/t/${tenantSlug}/room-categories`);
    return { status: "success", message: "Catégorie mise à jour." };
  } catch (err) {
    if (err instanceof ZodError) {
      return {
        status: "error",
        message: "Veuillez corriger les champs en erreur.",
        fieldErrors: zodFieldErrors(err),
      };
    }
    if (err instanceof RoomDomainError) {
      return { status: "error", message: friendlyDomainMessage(err) };
    }
    console.error("[UI] updateRoomCategoryAction:", err);
    return { status: "error", message: "Une erreur est survenue. Réessayez." };
  }
}

export async function setRoomCategoryActiveAction(
  tenantSlug: string,
  categoryId: string,
  isActive: boolean,
): Promise<ActionResult> {
  try {
    const { tenant, role } = await getTenantContext(tenantSlug);
    if (!canWrite(role)) {
      return {
        status: "error",
        message: "Vous n'avez pas les droits pour modifier cette catégorie.",
      };
    }
    const supabase = await createClient();
    await svc.setRoomCategoryActive(supabase, tenant.id, categoryId, { isActive });
    revalidatePath(`/t/${tenantSlug}/room-categories`);
    revalidatePath(`/t/${tenantSlug}/rooms`);
    revalidatePath(`/t/${tenantSlug}/dashboard`);
    return { status: "success" };
  } catch (err) {
    if (err instanceof RoomDomainError) {
      return { status: "error", message: friendlyDomainMessage(err) };
    }
    console.error("[UI] setRoomCategoryActiveAction:", err);
    return { status: "error", message: "Une erreur est survenue. Réessayez." };
  }
}
