import { describe, expect, it } from "vitest";
import {
  buildAdminOrdersExportApiSearchParams,
  buildAdminOrdersListApiSearchParams,
  parseAdminOrderListContractParams,
} from "@/lib/admin/adminOrdersListContract";

describe("adminOrdersListContract", () => {
  it("round-trips key list params", () => {
    const page = new URLSearchParams();
    page.set("q", "nguyen");
    page.set("payment", "paid");
    page.set("status", "Chưa hoàn thành");
    page.set("priority", "Ưu tiên cao");
    page.set("datePreset", "7d");
    page.set("pageSize", "50");
    page.set("cursor", "abc123");

    const api = buildAdminOrdersListApiSearchParams(page);
    const parsed = parseAdminOrderListContractParams(api);
    expect(parsed.q).toBe("nguyen");
    expect(parsed.payment).toBe("paid");
    expect(parsed.status).toBe("Chưa hoàn thành");
    expect(parsed.priority).toBe("Ưu tiên cao");
    expect(parsed.limit).toBe(50);
    expect(parsed.cursor).toBe("abc123");
    expect(parsed.direction).toBe("next");
  });

  it("normalizes direction fallback", () => {
    const api = new URLSearchParams("limit=50&direction=weird");
    const parsed = parseAdminOrderListContractParams(api);
    expect(parsed.direction).toBe("next");
  });

  it("builds export params without pagination keys", () => {
    const page = new URLSearchParams("q=abc&pageSize=100&cursor=token");
    const api = buildAdminOrdersExportApiSearchParams(page);
    expect(api.get("q")).toBe("abc");
    expect(api.get("cursor")).toBeNull();
    expect(api.get("limit")).toBeNull();
  });
});
