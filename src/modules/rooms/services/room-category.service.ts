/**
 * src/modules/rooms/services/room-category.service.ts
 * Service domaine — Catégories de chambres.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import type {
  RoomCategory,
  CreateRoomCategoryCommand,
  UpdateRoomCategoryCommand,
  SetRoomCategoryActiveCommand,
  ListRoomCategoriesFilter,
} from "../domain/types";
import { OccupancyCoherenceError } from "../domain/types";
import * as repo from "../persistence/supabase";

type DB = Database;

function assertOccupancyCoherence(
  baseOccupancy: number,
  maxAdults: number,
  maxOccupancy: number,
): void {
  if (maxOccupancy < baseOccupancy || maxAdults > maxOccupancy) {
    throw new OccupancyCoherenceError();
  }
}

export async function listRoomCategories(
  client: SupabaseClient<DB>,
  filter: ListRoomCategoriesFilter,
): Promise<RoomCategory[]> {
  return repo.listRoomCategories(client, filter);
}

export async function getRoomCategoryById(
  client: SupabaseClient<DB>,
  tenantId: string,
  id: string,
): Promise<RoomCategory> {
  return repo.getRoomCategoryById(client, tenantId, id);
}

export async function createRoomCategory(
  client: SupabaseClient<DB>,
  cmd: CreateRoomCategoryCommand,
): Promise<RoomCategory> {
  assertOccupancyCoherence(cmd.baseOccupancy, cmd.maxAdults, cmd.maxOccupancy);
  return repo.createRoomCategory(client, cmd);
}

export async function updateRoomCategory(
  client: SupabaseClient<DB>,
  tenantId: string,
  id: string,
  cmd: UpdateRoomCategoryCommand,
): Promise<RoomCategory> {
  // Récupérer l'état actuel pour valider la cohérence après patch partiel
  const current = await repo.getRoomCategoryById(client, tenantId, id);
  const merged = {
    baseOccupancy: cmd.baseOccupancy ?? current.baseOccupancy,
    maxAdults: cmd.maxAdults ?? current.maxAdults,
    maxOccupancy: cmd.maxOccupancy ?? current.maxOccupancy,
  };
  assertOccupancyCoherence(merged.baseOccupancy, merged.maxAdults, merged.maxOccupancy);
  return repo.updateRoomCategory(client, tenantId, id, cmd);
}

export async function setRoomCategoryActive(
  client: SupabaseClient<DB>,
  tenantId: string,
  id: string,
  cmd: SetRoomCategoryActiveCommand,
): Promise<RoomCategory> {
  return repo.setRoomCategoryActive(client, tenantId, id, cmd);
}
