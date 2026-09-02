/**
 * src/modules/rooms/domain/types.ts
 * Types de domaine CORE-1 — Catégories de chambres et Chambres.
 * STACKED_ON_UNMERGED_F1: OUI
 */

// ─────────────────────────────────────────────────────────────────────────────
// Statut opérationnel
// ─────────────────────────────────────────────────────────────────────────────

export const ROOM_OPERATIONAL_STATUSES = ["active", "inactive", "out_of_service"] as const;
export type RoomOperationalStatus = (typeof ROOM_OPERATIONAL_STATUSES)[number];

// ─────────────────────────────────────────────────────────────────────────────
// RoomCategory — entité
// ─────────────────────────────────────────────────────────────────────────────

export interface RoomCategory {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  description: string | null;
  baseOccupancy: number;
  maxAdults: number;
  maxChildren: number;
  maxOccupancy: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoomCategoryCommand {
  /** tenant_id fourni exclusivement par le serveur (résolution tenant F1) */
  tenantId: string;
  code: string;
  name: string;
  description?: string;
  baseOccupancy: number;
  maxAdults: number;
  maxChildren: number;
  maxOccupancy: number;
}

export interface UpdateRoomCategoryCommand {
  /** tenant_id ne peut jamais être modifié depuis une commande client */
  name?: string;
  description?: string;
  baseOccupancy?: number;
  maxAdults?: number;
  maxChildren?: number;
  maxOccupancy?: number;
}

export interface SetRoomCategoryActiveCommand {
  isActive: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Room — entité
// ─────────────────────────────────────────────────────────────────────────────

export interface Room {
  id: string;
  tenantId: string;
  roomCategoryId: string;
  code: string;
  name: string | null;
  floor: string | null;
  description: string | null;
  operationalStatus: RoomOperationalStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoomCommand {
  tenantId: string;
  roomCategoryId: string;
  code: string;
  name?: string;
  floor?: string;
  description?: string;
  operationalStatus?: RoomOperationalStatus;
}

export interface UpdateRoomCommand {
  roomCategoryId?: string;
  name?: string;
  floor?: string;
  description?: string;
}

export interface SetRoomStatusCommand {
  operationalStatus: RoomOperationalStatus;
  isActive?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Pagination / filtres
// ─────────────────────────────────────────────────────────────────────────────

export interface ListRoomCategoriesFilter {
  tenantId: string;
  activeOnly?: boolean;
  limit?: number;
  offset?: number;
}

export interface ListRoomsFilter {
  tenantId: string;
  roomCategoryId?: string;
  operationalStatus?: RoomOperationalStatus;
  activeOnly?: boolean;
  limit?: number;
  offset?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Erreurs domaine
// ─────────────────────────────────────────────────────────────────────────────

export class RoomDomainError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = "RoomDomainError";
  }
}

export class RoomNotFoundError extends RoomDomainError {
  constructor(id: string) {
    super(`Room not found: ${id}`, "ROOM_NOT_FOUND");
  }
}

export class RoomCategoryNotFoundError extends RoomDomainError {
  constructor(id: string) {
    super(`Room category not found: ${id}`, "ROOM_CATEGORY_NOT_FOUND");
  }
}

export class RoomCodeConflictError extends RoomDomainError {
  constructor(code: string) {
    super(`Room code already exists in tenant: ${code}`, "ROOM_CODE_CONFLICT");
  }
}

export class RoomCategoryCodeConflictError extends RoomDomainError {
  constructor(code: string) {
    super(`Room category code already exists in tenant: ${code}`, "ROOM_CATEGORY_CODE_CONFLICT");
  }
}

export class CrossTenantError extends RoomDomainError {
  constructor() {
    super("Cross-tenant operation is forbidden", "CROSS_TENANT_FORBIDDEN");
  }
}

export class OccupancyCoherenceError extends RoomDomainError {
  constructor() {
    super(
      "max_occupancy must be >= base_occupancy and max_adults must be <= max_occupancy",
      "OCCUPANCY_INCOHERENT",
    );
  }
}
