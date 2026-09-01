/**
 * tests/api/logout.test.ts
 * Tests du handler POST /api/kjemo/v1/auth/logout
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSignOut = vi.fn().mockResolvedValue({ error: null });

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { signOut: mockSignOut },
  }),
}));

vi.mock("next/server", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next/server")>();
  return {
    ...actual,
    NextResponse: {
      ...actual.NextResponse,
      redirect: vi.fn().mockReturnValue({ status: 302, headers: {} }),
    },
  };
});

describe("POST /api/kjemo/v1/auth/logout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignOut.mockResolvedValue({ error: null });
  });

  it("appelle signOut et redirige vers /login", async () => {
    const { POST } = await import("@/app/api/kjemo/v1/auth/logout/route");
    const request = new Request("http://localhost/api/kjemo/v1/auth/logout", {
      method: "POST",
    });
    const response = await POST(request as never);
    expect(mockSignOut).toHaveBeenCalledOnce();
    expect(response).toBeDefined();
  });
});
