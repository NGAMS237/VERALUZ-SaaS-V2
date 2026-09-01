/**
 * src/modules/rooms/services/room.service.ts
 * Service domaine — Chambres.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import type {
  Room,
  CreateRoomCommand,
  UpdateRoomCommand,
  SetRoomStatusCommand,
  ListRoomsFilter,
} from "../domain/types";
import * as repo from "../persistence/supabase";

type DB = Database;

export async function listRooms(
  client: SupabaseClient<DB>,
  filter: ListRoomsFilter,
): Promise<Room[]> {
  return repo.listRooms(client, filter);
}

export async function getRoomById(
  client: SupabaseClient<DB>,
  tenantId: string,
  id: string,
): Promise<Room> {
  return repo.getRoomById(client, tenantId, id);
}

export async function createRoom(
  client: SupabaseClient<DB>,
  cmd: CreateRoomCommand,
): Promise<Room> {
  return repo.createRoom(client, cmd);
}

export async function updateRoom(
  client: SupabaseClient<DB>,
  tenantId: string,
  id: string,
  cmd: UpdateRoomCommand,
): Promise<Room> {
  return repo.updateRoom(client, tenantId, id, cmd);
}

export async function setRoomStatus(
  client: SupabaseClient<DB>,
  tenantId: string,
  id: string,
  cmd: SetRoomStatusCommand,
): Promise<Room> {
  return repo.setRoomStatus(client, tenantId, id, cmd);
}
