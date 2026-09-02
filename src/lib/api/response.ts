/**
 * src/lib/api/response.ts
 * Helpers pour les réponses JSON structurées des Route Handlers.
 */

import { NextResponse } from "next/server";
import {
  RoomDomainError,
  RoomNotFoundError,
  RoomCategoryNotFoundError,
  RoomCodeConflictError,
  RoomCategoryCodeConflictError,
} from "@/modules/rooms/domain/types";
import { TenantSettingsNotFoundError } from "@/modules/settings/domain/types";
import {
  TenantSlugError,
  TenantNotFoundError,
  TenantAccessDeniedError,
} from "@/modules/tenant/resolver";
import { ZodError } from "zod";

export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ data }, { status });
}

export function created<T>(data: T): NextResponse {
  return NextResponse.json({ data }, { status: 201 });
}

export function handleError(err: unknown): NextResponse {
  // Auth / tenant
  if (err instanceof TenantSlugError)
    return NextResponse.json({ error: "Bad Request", message: err.message }, { status: 400 });
  if (err instanceof TenantAccessDeniedError)
    return NextResponse.json({ error: "Forbidden", message: "Access denied" }, { status: 403 });
  if (err instanceof TenantNotFoundError)
    return NextResponse.json({ error: "Not Found", message: "Tenant not found" }, { status: 404 });

  // Validation Zod
  if (err instanceof ZodError)
    return NextResponse.json({ error: "Bad Request", issues: err.errors }, { status: 400 });

  // Domaine — 404
  if (
    err instanceof RoomNotFoundError ||
    err instanceof RoomCategoryNotFoundError ||
    err instanceof TenantSettingsNotFoundError
  )
    return NextResponse.json({ error: "Not Found", message: err.message }, { status: 404 });

  // Domaine — 409
  if (err instanceof RoomCodeConflictError || err instanceof RoomCategoryCodeConflictError)
    return NextResponse.json({ error: "Conflict", message: err.message }, { status: 409 });

  // Domaine — 400
  if (err instanceof RoomDomainError)
    return NextResponse.json({ error: "Bad Request", message: err.message }, { status: 400 });

  // Inattendu — 500 sans exposer les détails
  console.error("[API] Unexpected error:", err);
  return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
}
