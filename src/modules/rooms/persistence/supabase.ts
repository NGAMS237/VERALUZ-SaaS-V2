/**
 * src/modules/rooms/persistence/supabase.ts
 * Adaptateur Supabase pour les catégories de chambres et chambres.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import type {
  RoomCategory,
  Room,
  CreateRoomCategoryCommand,
  UpdateRoomCategoryCommand,
  SetRoomCategoryActiveCommand,
  CreateRoomCommand,
  UpdateRoomCommand,
  SetRoomStatusCommand,
  ListRoomCategoriesFilter,
  ListRoomsFilter,
} from "../domain/types";
import {
  RoomCategoryNotFoundError,
  RoomNotFoundError,
  RoomCategoryCodeConflictError,
  RoomCodeConflictError,
} from "../domain/types";

type DB = Database;
type CategoryRow = DB["public"]["Tables"]["room_categories"]["Row"];
type RoomRow = DB["public"]["Tables"]["rooms"]["Row"];

function mapCategory(row: CategoryRow): RoomCategory {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    code: row.code,
    name: row.name,
    description: row.description,
    baseOccupancy: row.base_occupancy,
    maxAdults: row.max_adults,
    maxChildren: row.max_children,
    maxOccupancy: row.max_occupancy,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapRoom(row: RoomRow): Room {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    roomCategoryId: row.room_category_id,
    code: row.code,
    name: row.name,
    floor: row.floor,
    description: row.description,
    operationalStatus: row.operational_status,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function isUniqueViolation(error: { code?: string }): boolean {
  return error.code === "23505";
}

// ─── RoomCategory ──────────────────────────────────────────────────────────

export async function listRoomCategories(
  client: SupabaseClient<DB>,
  filter: ListRoomCategoriesFilter,
): Promise<RoomCategory[]> {
  let query = client
    .from("room_categories")
    .select("*")
    .eq("tenant_id", filter.tenantId)
    .order("code");
  if (filter.activeOnly) query = query.eq("is_active", true);
  if (filter.limit !== undefined) query = query.limit(filter.limit);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapCategory);
}

export async function getRoomCategoryById(
  client: SupabaseClient<DB>,
  tenantId: string,
  id: string,
): Promise<RoomCategory> {
  const { data, error } = await client
    .from("room_categories")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("id", id)
    .single();
  if (error || !data) throw new RoomCategoryNotFoundError(id);
  return mapCategory(data);
}

export async function createRoomCategory(
  client: SupabaseClient<DB>,
  cmd: CreateRoomCategoryCommand,
): Promise<RoomCategory> {
  const { data, error } = await client
    .from("room_categories")
    .insert({
      tenant_id: cmd.tenantId,
      code: cmd.code,
      name: cmd.name,
      ...(cmd.description !== undefined ? { description: cmd.description } : {}),
      base_occupancy: cmd.baseOccupancy,
      max_adults: cmd.maxAdults,
      max_children: cmd.maxChildren,
      max_occupancy: cmd.maxOccupancy,
    })
    .select()
    .single();
  if (error) {
    if (isUniqueViolation(error)) throw new RoomCategoryCodeConflictError(cmd.code);
    throw new Error(error.message);
  }
  return mapCategory(data);
}

export async function updateRoomCategory(
  client: SupabaseClient<DB>,
  tenantId: string,
  id: string,
  cmd: UpdateRoomCategoryCommand,
): Promise<RoomCategory> {
  type Patch = DB["public"]["Tables"]["room_categories"]["Update"];
  const patch: Patch = {};
  if (cmd.name !== undefined) patch.name = cmd.name;
  if (cmd.description !== undefined) patch.description = cmd.description;
  if (cmd.baseOccupancy !== undefined) patch.base_occupancy = cmd.baseOccupancy;
  if (cmd.maxAdults !== undefined) patch.max_adults = cmd.maxAdults;
  if (cmd.maxChildren !== undefined) patch.max_children = cmd.maxChildren;
  if (cmd.maxOccupancy !== undefined) patch.max_occupancy = cmd.maxOccupancy;

  const { data, error } = await client
    .from("room_categories")
    .update(patch)
    .eq("tenant_id", tenantId)
    .eq("id", id)
    .select()
    .single();
  if (error || !data) throw new RoomCategoryNotFoundError(id);
  return mapCategory(data);
}

export async function setRoomCategoryActive(
  client: SupabaseClient<DB>,
  tenantId: string,
  id: string,
  cmd: SetRoomCategoryActiveCommand,
): Promise<RoomCategory> {
  const { data, error } = await client
    .from("room_categories")
    .update({ is_active: cmd.isActive })
    .eq("tenant_id", tenantId)
    .eq("id", id)
    .select()
    .single();
  if (error || !data) throw new RoomCategoryNotFoundError(id);
  return mapCategory(data);
}

// ─── Rooms ─────────────────────────────────────────────────────────────────

export async function listRooms(
  client: SupabaseClient<DB>,
  filter: ListRoomsFilter,
): Promise<Room[]> {
  let query = client.from("rooms").select("*").eq("tenant_id", filter.tenantId).order("code");
  if (filter.roomCategoryId) query = query.eq("room_category_id", filter.roomCategoryId);
  if (filter.operationalStatus) query = query.eq("operational_status", filter.operationalStatus);
  if (filter.activeOnly) query = query.eq("is_active", true);
  if (filter.limit !== undefined) query = query.limit(filter.limit);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapRoom);
}

export async function getRoomById(
  client: SupabaseClient<DB>,
  tenantId: string,
  id: string,
): Promise<Room> {
  const { data, error } = await client
    .from("rooms")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("id", id)
    .single();
  if (error || !data) throw new RoomNotFoundError(id);
  return mapRoom(data);
}

export async function createRoom(
  client: SupabaseClient<DB>,
  cmd: CreateRoomCommand,
): Promise<Room> {
  const { data, error } = await client
    .from("rooms")
    .insert({
      tenant_id: cmd.tenantId,
      room_category_id: cmd.roomCategoryId,
      code: cmd.code,
      ...(cmd.name !== undefined ? { name: cmd.name } : {}),
      ...(cmd.floor !== undefined ? { floor: cmd.floor } : {}),
      ...(cmd.description !== undefined ? { description: cmd.description } : {}),
      operational_status: cmd.operationalStatus ?? "active",
    })
    .select()
    .single();
  if (error) {
    if (isUniqueViolation(error)) throw new RoomCodeConflictError(cmd.code);
    throw new Error(error.message);
  }
  return mapRoom(data);
}

export async function updateRoom(
  client: SupabaseClient<DB>,
  tenantId: string,
  id: string,
  cmd: UpdateRoomCommand,
): Promise<Room> {
  type Patch = DB["public"]["Tables"]["rooms"]["Update"];
  const patch: Patch = {};
  if (cmd.roomCategoryId !== undefined) patch.room_category_id = cmd.roomCategoryId;
  if (cmd.name !== undefined) patch.name = cmd.name;
  if (cmd.floor !== undefined) patch.floor = cmd.floor;
  if (cmd.description !== undefined) patch.description = cmd.description;

  const { data, error } = await client
    .from("rooms")
    .update(patch)
    .eq("tenant_id", tenantId)
    .eq("id", id)
    .select()
    .single();
  if (error || !data) throw new RoomNotFoundError(id);
  return mapRoom(data);
}

export async function setRoomStatus(
  client: SupabaseClient<DB>,
  tenantId: string,
  id: string,
  cmd: SetRoomStatusCommand,
): Promise<Room> {
  type Patch = DB["public"]["Tables"]["rooms"]["Update"];
  const patch: Patch = { operational_status: cmd.operationalStatus };
  if (cmd.isActive !== undefined) patch.is_active = cmd.isActive;

  const { data, error } = await client
    .from("rooms")
    .update(patch)
    .eq("tenant_id", tenantId)
    .eq("id", id)
    .select()
    .single();
  if (error || !data) throw new RoomNotFoundError(id);
  return mapRoom(data);
}
