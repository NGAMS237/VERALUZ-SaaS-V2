/**
 * tests/api/core1/room-category-active.test.ts
 */
import { describe, it, expect, vi } from 'vitest';

const mockCategory = {
  id: 'cat-1', tenantId: 'tenant-1', code: 'STD', name: 'Standard',
  description: null, baseOccupancy: 1, maxAdults: 2, maxChildren: 0,
  maxOccupancy: 2, isActive: false, createdAt: '', updatedAt: '',
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
  setRoomCategoryActive: vi.fn().mockResolvedValue(mockCategory),
}));

const params = Promise.resolve({ tenantSlug: 'veraluz-001', categoryId: 'cat-1' });
function makeReq(body: unknown) {
  return new Request('http://localhost/api/kjemo/v1/t/veraluz-001/room-categories/cat-1/active', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('PATCH /room-categories/[categoryId]/active', () => {
  it('désactive la catégorie', async () => {
    const { PATCH } = await import('@/app/api/kjemo/v1/t/[tenantSlug]/room-categories/[categoryId]/active/route');
    const res = await PATCH(makeReq({ isActive: false }) as never, { params });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.isActive).toBe(false);
  });

  it('retourne 403 pour staff', async () => {
    const { resolveTenantContext } = await import('@/modules/tenant/resolver');
    vi.mocked(resolveTenantContext).mockResolvedValueOnce({ ...mockTenantCtx, role: 'staff' });
    const { PATCH } = await import('@/app/api/kjemo/v1/t/[tenantSlug]/room-categories/[categoryId]/active/route');
    const res = await PATCH(makeReq({ isActive: true }) as never, { params });
    expect(res.status).toBe(403);
  });
});
