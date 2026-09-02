"use server";

/**
 * src/app/t/[tenantSlug]/rooms/actions.ts
 * Server Actions — mutations Chambres.
 *
 * Appelle directement la couche services (même couche que les Route Handlers
 * kjemo/v1) : aucune duplication de logique métier entre API et UI.
 */

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getTenantContext, canWrite } from "@/lib/tenant-context";
import * as svc from "@/modules/rooms/services/room.service";
import {
  createRoomSchema,
  updateRoomSchema,
  setRoomStatusSchema,
} from "@/modules/rooms/domain/validators";
import type {
  CreateRoomCommand,
  UpdateRoomCommand,
  RoomOperationalStatus,
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
    case "ROOM_CODE_CONFLICT":
      return "Ce code de chambre est déjà utilisé pour cet établissement.";
    case "ROOM_NOT_FOUND":
      return "Cette chambre est introuvable.";
    case "ROOM_CATEGORY_NOT_FOUND":
      return "La catégorie sélectionnée est introuvable.";
    case "CROSS_TENANT_FORBIDDEN":
      return "Cette catégorie n'appartient pas à cet établissement.";
    default:
      return "La demande n'a pas pu être traitée.";
  }
}

function readOptionalText(formData: FormData, field: string): string | undefined {
  const raw = formData.get(field);
  return typeof raw === "string" && raw.trim() !== "" ? raw : undefined;
}

export async function createRoomAction(
  tenantSlug: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const { tenant, role } = await getTenantContext(tenantSlug);
    if (!canWrite(role)) {
      return { status: "error", message: "Vous n'avez pas les droits pour créer une chambre." };
    }

    const name = readOptionalText(formData, "name");
    const floor = readOptionalText(formData, "floor");
    const description = readOptionalText(formData, "description");
    const parsed = createRoomSchema.parse({
      roomCategoryId: formData.get("roomCategoryId"),
      code: formData.get("code"),
      ...(name !== undefined ? { name } : {}),
      ...(floor !== undefined ? { floor } : {}),
      ...(description !== undefined ? { description } : {}),
      operationalStatus: formData.get("operationalStatus") ?? "active",
    });

    const supabase = await createClient();
    const cmd: CreateRoomCommand = {
      tenantId: tenant.id,
      roomCategoryId: parsed.roomCategoryId,
      code: parsed.code,
      operationalStatus: parsed.operationalStatus as RoomOperationalStatus,
      ...(parsed.name !== undefined ? { name: parsed.name } : {}),
      ...(parsed.floor !== undefined ? { floor: parsed.floor } : {}),
      ...(parsed.description !== undefined ? { description: parsed.description } : {}),
    };
    await svc.createRoom(supabase, cmd);

    revalidatePath(`/t/${tenantSlug}/rooms`);
    revalidatePath(`/t/${tenantSlug}/dashboard`);
    return { status: "success", message: "Chambre créée." };
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
    console.error("[UI] createRoomAction:", err);
    return { status: "error", message: "Une erreur est survenue. Réessayez." };
  }
}

export async function updateRoomAction(
  tenantSlug: string,
  roomId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const { tenant, role } = await getTenantContext(tenantSlug);
    if (!canWrite(role)) {
      return {
        status: "error",
        message: "Vous n'avez pas les droits pour modifier cette chambre.",
      };
    }

    const name = readOptionalText(formData, "name");
    const floor = readOptionalText(formData, "floor");
    const description = readOptionalText(formData, "description");
    const parsed = updateRoomSchema.parse({
      roomCategoryId: formData.get("roomCategoryId"),
      ...(name !== undefined ? { name } : {}),
      ...(floor !== undefined ? { floor } : {}),
      ...(description !== undefined ? { description } : {}),
    });

    const supabase = await createClient();
    const cmd: UpdateRoomCommand = {
      ...(parsed.roomCategoryId !== undefined ? { roomCategoryId: parsed.roomCategoryId } : {}),
      ...(parsed.name !== undefined ? { name: parsed.name } : {}),
      ...(parsed.floor !== undefined ? { floor: parsed.floor } : {}),
      ...(parsed.description !== undefined ? { description: parsed.description } : {}),
    };
    await svc.updateRoom(supabase, tenant.id, roomId, cmd);

    revalidatePath(`/t/${tenantSlug}/rooms`);
    return { status: "success", message: "Chambre mise à jour." };
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
    console.error("[UI] updateRoomAction:", err);
    return { status: "error", message: "Une erreur est survenue. Réessayez." };
  }
}

export async function setRoomStatusAction(
  tenantSlug: string,
  roomId: string,
  operationalStatus: RoomOperationalStatus,
): Promise<ActionResult> {
  try {
    const { tenant, role } = await getTenantContext(tenantSlug);
    if (!canWrite(role)) {
      return { status: "error", message: "Vous n'avez pas les droits pour modifier le statut." };
    }
    const parsed = setRoomStatusSchema.parse({ operationalStatus });
    const supabase = await createClient();
    await svc.setRoomStatus(supabase, tenant.id, roomId, {
      operationalStatus: parsed.operationalStatus as RoomOperationalStatus,
    });
    revalidatePath(`/t/${tenantSlug}/rooms`);
    revalidatePath(`/t/${tenantSlug}/dashboard`);
    return { status: "success" };
  } catch (err) {
    if (err instanceof RoomDomainError) {
      return { status: "error", message: friendlyDomainMessage(err) };
    }
    console.error("[UI] setRoomStatusAction:", err);
    return { status: "error", message: "Une erreur est survenue. Réessayez." };
  }
}
