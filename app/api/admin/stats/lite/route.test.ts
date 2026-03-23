import { describe, expect, it, vi } from "vitest";

const { mockCreateClient, mockRequireAdminApiSession, mockComputeAdminStatsLiteForApi } =
  vi.hoisted(() => ({
    mockCreateClient: vi.fn(),
    mockRequireAdminApiSession: vi.fn(),
    mockComputeAdminStatsLiteForApi: vi.fn(),
  }));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mockCreateClient,
}));

vi.mock("@/lib/auth/requireAdminApi", () => ({
  requireAdminApiSession: mockRequireAdminApiSession,
}));

vi.mock("@/lib/orders/adminStats.server", () => ({
  computeAdminStatsLiteForApi: mockComputeAdminStatsLiteForApi,
}));

import { GET } from "./route";

describe("GET /api/admin/stats/lite", () => {
  it("returns stable lite payload shape on success", async () => {
    const payload = {
      ordersToday: 1,
      unpaidCount: 2,
      pendingPrintCount: 3,
      highPriorityPendingCount: 4,
      awaitingDeliveryCount: 5,
      max_created_at: "2026-03-23T10:00:00.000Z",
    };
    mockCreateClient.mockResolvedValue({} as unknown);
    mockRequireAdminApiSession.mockResolvedValue({ ok: true });
    mockComputeAdminStatsLiteForApi.mockResolvedValue({
      data: payload,
      error: null,
    });

    const res = await GET();
    const json = (await res.json()) as Record<string, unknown>;

    expect(res.status).toBe(200);
    expect(json).toEqual(payload);
  });

  it("returns 500 with error message when compute fails", async () => {
    mockCreateClient.mockResolvedValue({} as unknown);
    mockRequireAdminApiSession.mockResolvedValue({ ok: true });
    mockComputeAdminStatsLiteForApi.mockResolvedValue({
      data: null,
      error: new Error("boom"),
    });

    const res = await GET();
    const json = (await res.json()) as { error?: string };

    expect(res.status).toBe(500);
    expect(json.error).toBe("boom");
  });
});
