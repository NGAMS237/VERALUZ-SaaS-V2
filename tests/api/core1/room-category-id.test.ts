/**
 * tests/api/core1/room-category-id.test.ts
 */
import { describe, it, expect, vi } from 'vitest';

const mockCategory = {
  id: 'cat-1', tenantId: 'tenant-1', code: 'STD', name: 'Standard',
  description: null, baseOccupancy: 1, maxAdults: 2, maxChildren: 0,
  maxOccupancy: 2, isActive: true, createdAt: '', updatedAt: '',
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
vi.mock('@/modules/rooms/services/room-category.service', () => ({
  getRoomCategoryById: vi.fn().mockResolvedValue(mockCategory),
  updateRoomCategory: vi.fn().mockResolvedValue({ ...mockCategory, name: 'Updated' }),
}));

const params = Promise.resolve({ tenantSlug: 'veraluz-001', categoryId: 'cat-1' });
function makeReq(method: string, body?: unknown) {
  return new Request('http://localhost/api/kjemo/v1/t/veraluz-001/room-categories/cat-1', {
    method,
    ...(body !== undefined ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {}),
  });
}

describe('GET /room-categories/[categoryId]', () => {
  it('retourne la catégorie', async () => {
    const { GET } = await import('@/app/api/kjemo/v1/t/[tenantSlug]/room-categories/[categoryId]/route');
    const res = await GET(makeReq('GET') as never, { params });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.id).toBe('cat-1');
  });
});

describe('PATCH /room-categories/[categoryId]', () => {
  it('met à jour la catégorie', async () => {
    const { PATCH } = await import('@/app/api/kjemo/v1/t/[tenantSlug]/room-categories/[categoryId]/route');
    const res = await PATCH(makeReq('PATCH', { name: 'Updated' }) as never, { params });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.name).toBe('Updated');
  });

  it('retourne 403 pour staff', async () => {
    const { resolveTenantContext } = await import('@/modules/tenant/resolver');
    vi.mocked(resolveTenantContext).mockResolvedValueOnce({ ...mockTenantCtx, role: 'staff' });
    const { PATCH } = await import('@/app/api/kjemo/v1/t/[tenantSlug]/room-categories/[categoryId]/route');
    const res = await PATCH(makeReq('PATCH', { name: 'X' }) as never, { params });
    expect(res.status).toBe(403);
  });
});

describe('GET /room-categories/[categoryId] — erreur service', () => {
  it('retourne 500 si service throw', async () => {
    const { getRoomCategoryById } = await import('@/modules/rooms/services/room-category.service');
    vi.mocked(getRoomCategoryById).mockRejectedValueOnce(new Error('fail'));
    const { GET } = await import('@/app/api/kjemo/v1/t/[tenantSlug]/room-categories/[categoryId]/route');
    const res = await GET(makeReq('GET') as never, { params });
    expect(res.status).toBe(500);
  });
});

describe('PATCH /room-categories/[categoryId] — champs optionnels', () => {
  it('patch avec tous les champs', async () => {
    const { PATCH } = await import('@/app/api/kjemo/v1/t/[tenantSlug]/room-categories/[categoryId]/route');
    const body = { name: 'X', description: 'desc', baseOccupancy: 1, maxAdults: 2, maxChildren: 1, maxOccupancy: 3 };
    const res = await PATCH(makeReq('PATCH', body) as never, { params });
    expect(res.status).toBe(200);
  });
});
