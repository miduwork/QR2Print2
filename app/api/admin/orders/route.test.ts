import { describe, expect, it, vi } from "vitest";

const {
  mockCreateClient,
  mockRequireAdminApiSession,
  mockParseAdminOrderListParams,
  mockListOrdersForAdminFiltered,
} = vi.hoisted(() => ({
  mockCreateClient: vi.fn(),
  mockRequireAdminApiSession: vi.fn(),
  mockParseAdminOrderListParams: vi.fn(),
  mockListOrdersForAdminFiltered: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mockCreateClient,
}));

vi.mock("@/lib/auth/requireAdminApi", () => ({
  requireAdminApiSession: mockRequireAdminApiSession,
}));

vi.mock("@/lib/orders/adminOrderListQuery", () => ({
  parseAdminOrderListParams: mockParseAdminOrderListParams,
  listOrdersForAdminFiltered: mockListOrdersForAdminFiltered,
}));

import { GET } from "./route";

describe("GET /api/admin/orders response shape", () => {
  it("returns hasMore with nullable total by default", async () => {
    const supabase = {} as unknown;
    const parsed = { limit: 50, offset: 0, cursor: null } as unknown;
    const orders = [{ id: "o1" }] as unknown;

    mockCreateClient.mockResolvedValue(supabase);
    mockRequireAdminApiSession.mockResolvedValue({ ok: true });
    mockParseAdminOrderListParams.mockReturnValue(parsed);
    mockListOrdersForAdminFiltered.mockResolvedValue({
      data: orders,
      error: null,
      hasMore: true,
      total: null,
      nextCursor: "next-token-1",
    });

    const req = {
      nextUrl: { searchParams: new URLSearchParams("limit=50&offset=0") },
    } as unknown;

    const res = await GET(req as never);
    const json = (await res.json()) as Record<string, unknown>;

    expect(json).toMatchObject({
      orders,
      hasMore: true,
      total: null,
      limit: 50,
      offset: 0,
      currentCursor: null,
      nextCursor: "next-token-1",
    });
  });

  it("returns exact total when includeTotal=exact is requested", async () => {
    const supabase = {} as unknown;
    const parsed = {
      limit: 25,
      offset: 25,
      includeTotalExact: true,
      cursor: "cursor-25",
    } as unknown;
    const orders = [{ id: "o2" }] as unknown;

    mockCreateClient.mockResolvedValue(supabase);
    mockRequireAdminApiSession.mockResolvedValue({ ok: true });
    mockParseAdminOrderListParams.mockReturnValue(parsed);
    mockListOrdersForAdminFiltered.mockResolvedValue({
      data: orders,
      error: null,
      hasMore: false,
      total: 26,
      nextCursor: null,
    });

    const req = {
      nextUrl: {
        searchParams: new URLSearchParams(
          "limit=25&offset=25&includeTotal=exact",
        ),
      },
    } as unknown;

    const res = await GET(req as never);
    const json = (await res.json()) as Record<string, unknown>;

    expect(json).toMatchObject({
      orders,
      hasMore: false,
      total: 26,
      limit: 25,
      offset: 25,
      currentCursor: "cursor-25",
      nextCursor: null,
    });
  });
});
