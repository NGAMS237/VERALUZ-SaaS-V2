/**
 * tests/api/core1/settings.test.ts
 * Tests route handlers CORE-1 — tenant settings
 */

import { describe, it, expect, vi } from 'vitest';

const mockSettings = {
  tenantId: 'tenant-1', timezone: 'Africa/Douala',
  currencyCode: 'XAF', locale: 'fr-CM',
  checkInTime: null, checkOutTime: '12:00',
  createdAt: '2026-09-01T00:00:00Z', updatedAt: '2026-09-01T00:00:00Z',
};
const mockTenantCtx = {
  tenant: { id: 'tenant-1', slug: 'veraluz-001', name: 'Test', created_at: '', updated_at: '' },
  role: 'owner' as const, userId: 'user-1',
};

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn().mockResolvedValue({}) }));
vi.mock('@/modules/tenant/resolver', () => ({
  resolveTenantContext: vi.fn().mockResolvedValue(mockTenantCtx),
  TenantSlugError: class extends Error {},
  TenantNotFoundError: class extends Error {},
  TenantAccessDeniedError: class extends Error {},
}));
vi.mock('@/modules/settings/services/tenant-settings.service', () => ({
  getTenantSettings: vi.fn().mockResolvedValue(mockSettings),
  updateTenantSettings: vi.fn().mockResolvedValue(mockSettings),
}));

const params = Promise.resolve({ tenantSlug: 'veraluz-001' });

describe('GET /settings', () => {
  it('retourne les paramètres', async () => {
    const { GET } = await import('@/app/api/kjemo/v1/t/[tenantSlug]/settings/route');
    const req = new Request('http://localhost/', { method: 'GET' });
    const res = await GET(req as never, { params });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.checkOutTime).toBe('12:00');
  });
});

describe('PUT /settings', () => {
  it('met à jour les paramètres', async () => {
    const { PUT } = await import('@/app/api/kjemo/v1/t/[tenantSlug]/settings/route');
    const body = { checkOutTime: '12:00', timezone: 'Africa/Douala' };
    const req = new Request('http://localhost/', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    const res = await PUT(req as never, { params });
    expect(res.status).toBe(200);
  });

  it('retourne 403 pour viewer', async () => {
    const { resolveTenantContext } = await import('@/modules/tenant/resolver');
    vi.mocked(resolveTenantContext).mockResolvedValueOnce({ ...mockTenantCtx, role: 'viewer' });
    const { PUT } = await import('@/app/api/kjemo/v1/t/[tenantSlug]/settings/route');
    const req = new Request('http://localhost/', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ timezone: 'UTC' }),
    });
    const res = await PUT(req as never, { params });
    expect(res.status).toBe(403);
  });
});

describe('GET /settings — erreur service', () => {
  it('retourne 500 si service throw', async () => {
    const { getTenantSettings } = await import('@/modules/settings/services/tenant-settings.service');
    vi.mocked(getTenantSettings).mockRejectedValueOnce(new Error('fail'));
    const { GET } = await import('@/app/api/kjemo/v1/t/[tenantSlug]/settings/route');
    const req = new Request('http://localhost/', { method: 'GET' });
    const res = await GET(req as never, { params });
    expect(res.status).toBe(500);
  });
});

describe('PUT /settings — champs optionnels', () => {
  it('patch avec tous les champs', async () => {
    const { PUT } = await import('@/app/api/kjemo/v1/t/[tenantSlug]/settings/route');
    const body = { timezone: 'UTC', currencyCode: 'USD', locale: 'en-US', checkInTime: '14:00', checkOutTime: '11:00' };
    const req = new Request('http://localhost/', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    const res = await PUT(req as never, { params });
    expect(res.status).toBe(200);
  });
});
