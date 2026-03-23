import { describe, expect, it } from "vitest";
import { buildAdminOrdersListApiQuery } from "@/lib/admin/adminOrdersListUrl";
import {
  deriveAdminListPageWindow,
  parseAdminOrderListParams,
} from "@/lib/orders/adminOrderListQuery";
import { ORDER_PRIORITY, ORDER_STATUS } from "@/lib/orders/types";

describe("parseAdminOrderListParams", () => {
  it("reads priority for list filter", () => {
    const sp = new URLSearchParams();
    sp.set("priority", ORDER_PRIORITY.HIGH);
    sp.set("status", ORDER_STATUS.PENDING);
    sp.set("limit", "50");
    sp.set("offset", "0");
    const p = parseAdminOrderListParams(sp);
    expect(p.priority).toBe(ORDER_PRIORITY.HIGH);
    expect(p.status).toBe(ORDER_STATUS.PENDING);
  });

  it("treats missing priority as empty", () => {
    const sp = new URLSearchParams();
    sp.set("limit", "50");
    sp.set("offset", "0");
    const p = parseAdminOrderListParams(sp);
    expect(p.priority).toBe("");
  });

  it("parses includeTotal=exact", () => {
    const sp = new URLSearchParams();
    sp.set("includeTotal", "exact");
    const p = parseAdminOrderListParams(sp);
    expect(p.includeTotalExact).toBe(true);
  });

  it("keeps includeTotalExact false by default", () => {
    const p = parseAdminOrderListParams(new URLSearchParams());
    expect(p.includeTotalExact).toBe(false);
  });

  it("parses cursor and direction", () => {
    const sp = new URLSearchParams();
    sp.set("cursor", "abc123");
    sp.set("direction", "prev");
    const p = parseAdminOrderListParams(sp);
    expect(p.cursor).toBe("abc123");
    expect(p.direction).toBe("prev");
  });
});

describe("buildAdminOrdersListApiQuery", () => {
  it("forwards priority to API query string", () => {
    const sp = new URLSearchParams();
    sp.set("priority", ORDER_PRIORITY.HIGH);
    sp.set("page", "0");
    sp.set("pageSize", "50");
    const q = buildAdminOrdersListApiQuery(sp);
    const roundTrip = new URLSearchParams(q);
    expect(roundTrip.get("priority")).toBe(ORDER_PRIORITY.HIGH);
  });

  it("forwards cursor and omits offset paging", () => {
    const sp = new URLSearchParams();
    sp.set("cursor", "token123");
    sp.set("pageSize", "50");
    const q = buildAdminOrdersListApiQuery(sp);
    const roundTrip = new URLSearchParams(q);
    expect(roundTrip.get("cursor")).toBe("token123");
    expect(roundTrip.get("offset")).toBeNull();
  });
});

describe("deriveAdminListPageWindow", () => {
  it("sets hasMore and trims to limit", () => {
    const r = deriveAdminListPageWindow([1, 2, 3, 4], 3);
    expect(r.hasMore).toBe(true);
    expect(r.rows).toEqual([1, 2, 3]);
  });

  it("returns full rows when below/equal limit", () => {
    const r = deriveAdminListPageWindow([1, 2, 3], 3);
    expect(r.hasMore).toBe(false);
    expect(r.rows).toEqual([1, 2, 3]);
  });
});
