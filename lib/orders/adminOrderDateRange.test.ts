import { describe, expect, it, vi, afterEach, beforeEach } from "vitest";
import {
  addDaysToYmd,
  isValidYmd,
  parseCreatedAtRangeFromSearchParams,
  vnRangeBoundsUtcIso,
} from "@/lib/orders/adminOrderDateRange";
import {
  normalizeAdminOrderPageSize,
  parseAdminOrderListParams,
} from "@/lib/orders/adminOrderListQuery";

describe("isValidYmd", () => {
  it("accepts valid dates", () => {
    expect(isValidYmd("2025-01-15")).toBe(true);
  });
  it("rejects invalid calendar dates", () => {
    expect(isValidYmd("2025-02-30")).toBe(false);
  });
});

describe("addDaysToYmd", () => {
  it("subtracts across month boundary", () => {
    expect(addDaysToYmd("2025-03-10", -6)).toBe("2025-03-04");
  });
});

describe("vnRangeBoundsUtcIso", () => {
  it("includes both ends and swaps when from > to", () => {
    const r = vnRangeBoundsUtcIso("2025-01-12", "2025-01-10");
    expect(r.gte).toBe(new Date("2025-01-10T00:00:00+07:00").toISOString());
    expect(r.lte).toBe(new Date("2025-01-12T23:59:59.999+07:00").toISOString());
  });
});

describe("parseCreatedAtRangeFromSearchParams", () => {
  it("prefers dateFrom and dateTo when both valid", () => {
    const sp = new URLSearchParams();
    sp.set("dateFrom", "2025-01-10");
    sp.set("dateTo", "2025-01-12");
    sp.set("datePreset", "today");
    const r = parseCreatedAtRangeFromSearchParams(
      sp,
      new Date("2025-06-01T12:00:00Z"),
    );
    expect(r).not.toBeNull();
    expect(r!.gte).toBe(new Date("2025-01-10T00:00:00+07:00").toISOString());
    expect(r!.lte).toBe(new Date("2025-01-12T23:59:59.999+07:00").toISOString());
  });

  it("returns null when no preset and no range", () => {
    expect(
      parseCreatedAtRangeFromSearchParams(new URLSearchParams(), new Date()),
    ).toBeNull();
  });

  describe("with fixed clock", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2025-03-15T08:00:00Z"));
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    it("datePreset today matches VN calendar day", () => {
      const sp = new URLSearchParams();
      sp.set("datePreset", "today");
      const r = parseCreatedAtRangeFromSearchParams(sp, new Date());
      expect(r).not.toBeNull();
      expect(r!.gte).toBe(new Date("2025-03-15T00:00:00+07:00").toISOString());
      expect(r!.lte).toBe(new Date("2025-03-15T23:59:59.999+07:00").toISOString());
    });

    it("datePreset 7d spans 7 calendar days including today", () => {
      const sp = new URLSearchParams();
      sp.set("datePreset", "7d");
      const r = parseCreatedAtRangeFromSearchParams(sp, new Date());
      expect(r).not.toBeNull();
      expect(r!.gte).toBe(new Date("2025-03-09T00:00:00+07:00").toISOString());
      expect(r!.lte).toBe(new Date("2025-03-15T23:59:59.999+07:00").toISOString());
    });
  });
});

describe("normalizeAdminOrderPageSize", () => {
  it("keeps allowed sizes", () => {
    expect(normalizeAdminOrderPageSize(25)).toBe(25);
    expect(normalizeAdminOrderPageSize(50)).toBe(50);
    expect(normalizeAdminOrderPageSize(100)).toBe(100);
  });
  it("maps unknown values to default 50", () => {
    expect(normalizeAdminOrderPageSize(500)).toBe(50);
    expect(normalizeAdminOrderPageSize(77)).toBe(50);
  });
});

describe("parseAdminOrderListParams + date", () => {
  it("includes created bounds when datePreset is today", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-03-15T08:00:00Z"));
    const sp = new URLSearchParams();
    sp.set("datePreset", "today");
    sp.set("limit", "50");
    sp.set("offset", "0");
    const p = parseAdminOrderListParams(sp);
    expect(p.createdAtGte).not.toBeNull();
    expect(p.createdAtLte).not.toBeNull();
    vi.useRealTimers();
  });
});
