/**
 * tests/api/core1/room-id.test.ts
 */
import { describe, it, expect, vi } from 'vitest';

const mockRoom = {
  id: 'room-1', tenantId: 'tenant-1', roomCategoryId: 'cat-1',
  code: '101', name: null, floor: null, description: null,
  operationalStatus: 'active' as const, createdAt: '', updatedAt: '',
};
const mockTenantCtx = {
  tenant: { id: 'tenant-1', slug: 'veraluz-001', name: 'T', created_at: '', updated_at: '' },
  role: 'owner' as const, userId: 'user-1',
};

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn().mockResolvedValue({}) }));
vi.mock('@/modules/tenant/resolver', () => ({
  resolveTenantContext: vi.fn().mockResolvedValue(mockTenantCtx),
  TenantSlugError: class extends Error {},
  TenantNotFoundError: class extends Error {},
  TenantAccessDeniedError: class extends Error {},
}));
vi.mock('@/modules/rooms/services/room.service', () => ({
  getRoomById: vi.fn().mockResolvedValue(mockRoom),
  updateRoom: vi.fn().mockResolvedValue({ ...mockRoom, name: 'Chambre 101' }),
}));

const params = Promise.resolve({ tenantSlug: 'veraluz-001', roomId: 'room-1' });
function makeReq(method: string, body?: unknown) {
  return new Request('http://localhost/api/kjemo/v1/t/veraluz-001/rooms/room-1', {
    method,
    ...(body !== undefined ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {}),
  });
}

describe('GET /rooms/[roomId]', () => {
  it('retourne la chambre', async () => {
    const { GET } = await import('@/app/api/kjemo/v1/t/[tenantSlug]/rooms/[roomId]/route');
    const res = await GET(makeReq('GET') as never, { params });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.id).toBe('room-1');
  });
});

describe('PATCH /rooms/[roomId]', () => {
  it('met à jour la chambre', async () => {
    const { PATCH } = await import('@/app/api/kjemo/v1/t/[tenantSlug]/rooms/[roomId]/route');
    const res = await PATCH(makeReq('PATCH', { name: 'Chambre 101' }) as never, { params });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.name).toBe('Chambre 101');
  });

  it('retourne 403 pour staff', async () => {
    const { resolveTenantContext } = await import('@/modules/tenant/resolver');
    vi.mocked(resolveTenantContext).mockResolvedValueOnce({ ...mockTenantCtx, role: 'staff' });
    const { PATCH } = await import('@/app/api/kjemo/v1/t/[tenantSlug]/rooms/[roomId]/route');
    const res = await PATCH(makeReq('PATCH', { name: 'X' }) as never, { params });
    expect(res.status).toBe(403);
  });
});

describe('GET /rooms/[roomId] — erreur service', () => {
  it('retourne 500 si service throw', async () => {
    const { getRoomById } = await import('@/modules/rooms/services/room.service');
    vi.mocked(getRoomById).mockRejectedValueOnce(new Error('fail'));
    const { GET } = await import('@/app/api/kjemo/v1/t/[tenantSlug]/rooms/[roomId]/route');
    const res = await GET(makeReq('GET') as never, { params });
    expect(res.status).toBe(500);
  });
});

describe('PATCH /rooms/[roomId] — champs optionnels', () => {
  it('patch avec tous les champs', async () => {
    const { PATCH } = await import('@/app/api/kjemo/v1/t/[tenantSlug]/rooms/[roomId]/route');
    const VALID_UUID = '00000000-0000-0000-0000-000000000001';
    const body = { roomCategoryId: VALID_UUID, name: 'Ch101', floor: '1', description: 'desc' };
    const res = await PATCH(makeReq('PATCH', body) as never, { params });
    expect(res.status).toBe(200);
  });
});
