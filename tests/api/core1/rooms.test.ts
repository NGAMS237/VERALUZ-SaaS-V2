/**
 * tests/api/core1/rooms.test.ts
 * Tests route handlers CORE-1 — rooms
 */

import { describe, it, expect, vi } from 'vitest';

const mockRoom = {
  id: 'room-1',
  tenantId: 'tenant-1',
  roomCategoryId: 'cat-1',
  code: '101',
  name: 'Chambre 101',
  floor: '1',
  description: null,
  operationalStatus: 'active',
  isActive: true,
  createdAt: '2026-09-01T00:00:00Z',
  updatedAt: '2026-09-01T00:00:00Z',
};

const mockTenantCtx = {
  tenant: { id: 'tenant-1', slug: 'veraluz-001', name: 'Test', created_at: '', updated_at: '' },
  role: 'owner' as const,
  userId: 'user-1',
};

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn().mockResolvedValue({}) }));
vi.mock('@/modules/tenant/resolver', () => ({
  resolveTenantContext: vi.fn().mockResolvedValue(mockTenantCtx),
  TenantSlugError: class extends Error {},
  TenantNotFoundError: class extends Error {},
  TenantAccessDeniedError: class extends Error {},
}));
vi.mock('@/modules/rooms/services/room.service', () => ({
  listRooms: vi.fn().mockResolvedValue([mockRoom]),
  getRoomById: vi.fn().mockResolvedValue(mockRoom),
  createRoom: vi.fn().mockResolvedValue(mockRoom),
  updateRoom: vi.fn().mockResolvedValue(mockRoom),
  setRoomStatus: vi.fn().mockResolvedValue({ ...mockRoom, operationalStatus: 'inactive' }),
}));

const VALID_UUID = '00000000-0000-0000-0000-000000000001';
const params = Promise.resolve({ tenantSlug: 'veraluz-001' });
const paramsRoom = Promise.resolve({ tenantSlug: 'veraluz-001', roomId: 'room-1' });

describe('GET /rooms', () => {
  it('retourne la liste', async () => {
    const { GET } = await import('@/app/api/kjemo/v1/t/[tenantSlug]/rooms/route');
    const req = new Request('http://localhost/api/kjemo/v1/t/veraluz-001/rooms', { method: 'GET' });
    const res = await GET(req as never, { params });
    expect(res.status).toBe(200);
  });
});

describe('POST /rooms', () => {
  it('crée une chambre', async () => {
    const { POST } = await import('@/app/api/kjemo/v1/t/[tenantSlug]/rooms/route');
    const body = { roomCategoryId: VALID_UUID, code: '101' };
    const req = new Request('http://localhost/api/kjemo/v1/t/veraluz-001/rooms', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    const res = await POST(req as never, { params });
    expect(res.status).toBe(201);
  });
});

describe('PATCH /rooms/[roomId]/status', () => {
  it('change le statut', async () => {
    const { PATCH } = await import('@/app/api/kjemo/v1/t/[tenantSlug]/rooms/[roomId]/status/route');
    const body = { operationalStatus: 'inactive' };
    const req = new Request('http://localhost/', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    const res = await PATCH(req as never, { params: paramsRoom });
    expect(res.status).toBe(200);
  });
});

describe('GET /rooms — filtre categoryId', () => {
  it('accepte ?categoryId=xxx', async () => {
    const { GET } = await import('@/app/api/kjemo/v1/t/[tenantSlug]/rooms/route');
    const req = new Request('http://localhost/api/kjemo/v1/t/veraluz-001/rooms?categoryId=cat-1', { method: 'GET' });
    const res = await GET(req as never, { params });
    expect(res.status).toBe(200);
  });
});

describe('POST /rooms — 403', () => {
  it('retourne 403 pour staff', async () => {
    const { resolveTenantContext } = await import('@/modules/tenant/resolver');
    vi.mocked(resolveTenantContext).mockResolvedValueOnce({ ...mockTenantCtx, role: 'staff' });
    const { POST } = await import('@/app/api/kjemo/v1/t/[tenantSlug]/rooms/route');
    const body = { roomCategoryId: VALID_UUID, code: '101' };
    const req = new Request('http://localhost/api/kjemo/v1/t/veraluz-001/rooms', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    const res = await POST(req as never, { params });
    expect(res.status).toBe(403);
  });
});

describe('GET /rooms — erreur service', () => {
  it('retourne 500 si service throw', async () => {
    const { listRooms } = await import('@/modules/rooms/services/room.service');
    vi.mocked(listRooms).mockRejectedValueOnce(new Error('db fail'));
    const { GET } = await import('@/app/api/kjemo/v1/t/[tenantSlug]/rooms/route');
    const req = new Request('http://localhost/api/kjemo/v1/t/veraluz-001/rooms', { method: 'GET' });
    const res = await GET(req as never, { params });
    expect(res.status).toBe(500);
  });
});

describe('PATCH /rooms/[roomId]/status — 403', () => {
  it('retourne 403 pour staff', async () => {
    const { resolveTenantContext } = await import('@/modules/tenant/resolver');
    vi.mocked(resolveTenantContext).mockResolvedValueOnce({ ...mockTenantCtx, role: 'staff' });
    const { PATCH } = await import('@/app/api/kjemo/v1/t/[tenantSlug]/rooms/[roomId]/status/route');
    const body = { operationalStatus: 'inactive' };
    const req = new Request('http://localhost/', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    const res = await PATCH(req as never, { params: paramsRoom });
    expect(res.status).toBe(403);
  });
});
