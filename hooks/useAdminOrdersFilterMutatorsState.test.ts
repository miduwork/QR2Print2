import { describe, expect, it } from "vitest";
import { ADMIN_ORDER_LIST_DEFAULT_LIMIT } from "@/lib/admin/adminOrdersListContract";
import {
  createAdminOrdersFilterMutators,
  createAdminOrdersReplaceSearchParams,
  type AdminOrdersListRouter,
  getAdminOrdersFilterDerivedState,
  getNextSearchParamsForDebouncedSearch,
} from "@/hooks/useAdminOrdersFiltersState";

describe("useAdminOrdersFilterMutatorsState (scaffold)", () => {
  it("reads and normalizes derived filter values from URL params", () => {
    const state = getAdminOrdersFilterDerivedState(
      new URLSearchParams(
        "payment=paid&status=pending&priority=urgent&pageSize=999&datePreset=today",
      ) as unknown as import("next/navigation").ReadonlyURLSearchParams,
    );

    expect(state.paymentFilter).toBe("paid");
    expect(state.statusFilter).toBe("pending");
    expect(state.priorityFilter).toBe("urgent");
    expect(state.pageSize).toBe(50);
    expect(state.presetTodayActive).toBe(true);
    expect(state.hasFilters).toBe(true);
  });

  it("falls back to default pageSize for invalid value", () => {
    const state = getAdminOrdersFilterDerivedState(
      new URLSearchParams("pageSize=invalid") as unknown as import("next/navigation").ReadonlyURLSearchParams,
    );

    expect(state.pageSize).toBe(ADMIN_ORDER_LIST_DEFAULT_LIMIT);
  });

  it("activates all preset when no date filter is selected", () => {
    const state = getAdminOrdersFilterDerivedState(
      new URLSearchParams("") as unknown as import("next/navigation").ReadonlyURLSearchParams,
    );

    expect(state.presetAllActive).toBe(true);
    expect(state.presetTodayActive).toBe(false);
    expect(state.preset7dActive).toBe(false);
    expect(state.hasDateFilter).toBe(false);
  });

  it("scaffold: changing search should mark hasFilters true", () => {
    const sp = getNextSearchParamsForDebouncedSearch("", "hello");
    const state = getAdminOrdersFilterDerivedState(
      (sp ?? new URLSearchParams()) as unknown as import("next/navigation").ReadonlyURLSearchParams,
    );
    expect(state.hasFilters).toBe(true);
  });

  it("integration: setPaymentFilter updates payment and resets cursor", () => {
    const calls: Array<{ href: string; options?: { scroll?: boolean } }> = [];
    const router: AdminOrdersListRouter = {
      replace: (href, options) => calls.push({ href, options }),
    };
    const replaceSearchParams = createAdminOrdersReplaceSearchParams(
      router,
      new URLSearchParams("q=a&cursor=c1&cursorStack=s1,s2") as unknown as import("next/navigation").ReadonlyURLSearchParams,
    );
    const mutators = createAdminOrdersFilterMutators(replaceSearchParams);

    mutators.setPaymentFilter("paid");

    expect(calls).toHaveLength(1);
    const next = new URL(calls[0]!.href, "https://example.test").searchParams;
    expect(next.get("payment")).toBe("paid");
    expect(next.has("cursor")).toBe(false);
    expect(next.has("cursorStack")).toBe(false);
    expect(calls[0]?.options).toEqual({ scroll: false });
  });

  it("integration: setPaymentFilter('') removes payment and resets cursor", () => {
    const calls: Array<{ href: string; options?: { scroll?: boolean } }> = [];
    const router: AdminOrdersListRouter = {
      replace: (href, options) => calls.push({ href, options }),
    };
    const replaceSearchParams = createAdminOrdersReplaceSearchParams(
      router,
      new URLSearchParams("payment=paid&status=pending&cursor=abc&cursorStack=1,2") as unknown as import("next/navigation").ReadonlyURLSearchParams,
    );
    const mutators = createAdminOrdersFilterMutators(replaceSearchParams);

    mutators.setPaymentFilter("");

    const next = new URL(calls[0]!.href, "https://example.test").searchParams;
    expect(next.has("payment")).toBe(false);
    expect(next.get("status")).toBe("pending");
    expect(next.has("cursor")).toBe(false);
    expect(next.has("cursorStack")).toBe(false);
  });

  it("integration: setDatePreset('all') clears date range and datePreset", () => {
    const calls: Array<{ href: string; options?: { scroll?: boolean } }> = [];
    const router: AdminOrdersListRouter = {
      replace: (href, options) => calls.push({ href, options }),
    };
    const replaceSearchParams = createAdminOrdersReplaceSearchParams(
      router,
      new URLSearchParams(
        "datePreset=7d&dateFrom=2026-01-01&dateTo=2026-01-31&cursor=abc",
      ) as unknown as import("next/navigation").ReadonlyURLSearchParams,
    );
    const mutators = createAdminOrdersFilterMutators(replaceSearchParams);

    mutators.setDatePreset("all");

    const next = new URL(calls[0]!.href, "https://example.test").searchParams;
    expect(next.has("datePreset")).toBe(false);
    expect(next.has("dateFrom")).toBe(false);
    expect(next.has("dateTo")).toBe(false);
    expect(next.has("cursor")).toBe(false);
  });

  it("integration: setPageSize normalizes value and resets cursor", () => {
    const calls: Array<{ href: string; options?: { scroll?: boolean } }> = [];
    const router: AdminOrdersListRouter = {
      replace: (href, options) => calls.push({ href, options }),
    };
    const replaceSearchParams = createAdminOrdersReplaceSearchParams(
      router,
      new URLSearchParams("pageSize=10&cursor=abc&cursorStack=1,2") as unknown as import("next/navigation").ReadonlyURLSearchParams,
    );
    const mutators = createAdminOrdersFilterMutators(replaceSearchParams);

    mutators.setPageSize(999);

    const next = new URL(calls[0]!.href, "https://example.test").searchParams;
    expect(next.get("pageSize")).toBe("50");
    expect(next.has("cursor")).toBe(false);
    expect(next.has("cursorStack")).toBe(false);
  });

  it("integration: setStatusFilter writes status and resets cursor", () => {
    const calls: Array<{ href: string; options?: { scroll?: boolean } }> = [];
    const router: AdminOrdersListRouter = {
      replace: (href, options) => calls.push({ href, options }),
    };
    const replaceSearchParams = createAdminOrdersReplaceSearchParams(
      router,
      new URLSearchParams("status=old&cursor=abc&cursorStack=1,2") as unknown as import("next/navigation").ReadonlyURLSearchParams,
    );
    const mutators = createAdminOrdersFilterMutators(replaceSearchParams);

    mutators.setStatusFilter("processing");

    const next = new URL(calls[0]!.href, "https://example.test").searchParams;
    expect(next.get("status")).toBe("processing");
    expect(next.has("cursor")).toBe(false);
    expect(next.has("cursorStack")).toBe(false);
  });

  it("integration: setPriorityFilter writes priority and resets cursor", () => {
    const calls: Array<{ href: string; options?: { scroll?: boolean } }> = [];
    const router: AdminOrdersListRouter = {
      replace: (href, options) => calls.push({ href, options }),
    };
    const replaceSearchParams = createAdminOrdersReplaceSearchParams(
      router,
      new URLSearchParams("priority=low&cursor=abc&cursorStack=1,2") as unknown as import("next/navigation").ReadonlyURLSearchParams,
    );
    const mutators = createAdminOrdersFilterMutators(replaceSearchParams);

    mutators.setPriorityFilter("urgent");

    const next = new URL(calls[0]!.href, "https://example.test").searchParams;
    expect(next.get("priority")).toBe("urgent");
    expect(next.has("cursor")).toBe(false);
    expect(next.has("cursorStack")).toBe(false);
  });

  it("integration: setDateFromInput sets dateFrom, clears preset, resets cursor", () => {
    const calls: Array<{ href: string; options?: { scroll?: boolean } }> = [];
    const router: AdminOrdersListRouter = {
      replace: (href, options) => calls.push({ href, options }),
    };
    const replaceSearchParams = createAdminOrdersReplaceSearchParams(
      router,
      new URLSearchParams("datePreset=7d&dateTo=2026-01-31&cursor=abc") as unknown as import("next/navigation").ReadonlyURLSearchParams,
    );
    const mutators = createAdminOrdersFilterMutators(replaceSearchParams);

    mutators.setDateFromInput("2026-01-01");

    const next = new URL(calls[0]!.href, "https://example.test").searchParams;
    expect(next.get("dateFrom")).toBe("2026-01-01");
    expect(next.get("dateTo")).toBe("2026-01-31");
    expect(next.has("datePreset")).toBe(false);
    expect(next.has("cursor")).toBe(false);
  });

  it("integration: setDateToInput sets dateTo, clears preset, resets cursor", () => {
    const calls: Array<{ href: string; options?: { scroll?: boolean } }> = [];
    const router: AdminOrdersListRouter = {
      replace: (href, options) => calls.push({ href, options }),
    };
    const replaceSearchParams = createAdminOrdersReplaceSearchParams(
      router,
      new URLSearchParams("datePreset=today&dateFrom=2026-01-01&cursor=abc") as unknown as import("next/navigation").ReadonlyURLSearchParams,
    );
    const mutators = createAdminOrdersFilterMutators(replaceSearchParams);

    mutators.setDateToInput("2026-01-31");

    const next = new URL(calls[0]!.href, "https://example.test").searchParams;
    expect(next.get("dateFrom")).toBe("2026-01-01");
    expect(next.get("dateTo")).toBe("2026-01-31");
    expect(next.has("datePreset")).toBe(false);
    expect(next.has("cursor")).toBe(false);
  });

  it("integration: setStatusFilter('') removes status and resets cursor", () => {
    const calls: Array<{ href: string; options?: { scroll?: boolean } }> = [];
    const router: AdminOrdersListRouter = {
      replace: (href, options) => calls.push({ href, options }),
    };
    const replaceSearchParams = createAdminOrdersReplaceSearchParams(
      router,
      new URLSearchParams("status=pending&q=keep&cursor=abc&cursorStack=1") as unknown as import("next/navigation").ReadonlyURLSearchParams,
    );
    const mutators = createAdminOrdersFilterMutators(replaceSearchParams);

    mutators.setStatusFilter("");

    const next = new URL(calls[0]!.href, "https://example.test").searchParams;
    expect(next.has("status")).toBe(false);
    expect(next.get("q")).toBe("keep");
    expect(next.has("cursor")).toBe(false);
    expect(next.has("cursorStack")).toBe(false);
  });

  it("integration: setPriorityFilter('') removes priority and resets cursor", () => {
    const calls: Array<{ href: string; options?: { scroll?: boolean } }> = [];
    const router: AdminOrdersListRouter = {
      replace: (href, options) => calls.push({ href, options }),
    };
    const replaceSearchParams = createAdminOrdersReplaceSearchParams(
      router,
      new URLSearchParams("priority=urgent&payment=paid&cursor=abc") as unknown as import("next/navigation").ReadonlyURLSearchParams,
    );
    const mutators = createAdminOrdersFilterMutators(replaceSearchParams);

    mutators.setPriorityFilter("");

    const next = new URL(calls[0]!.href, "https://example.test").searchParams;
    expect(next.has("priority")).toBe(false);
    expect(next.get("payment")).toBe("paid");
    expect(next.has("cursor")).toBe(false);
  });

  it("integration: setDateFromInput('') removes dateFrom, clears preset, resets cursor", () => {
    const calls: Array<{ href: string; options?: { scroll?: boolean } }> = [];
    const router: AdminOrdersListRouter = {
      replace: (href, options) => calls.push({ href, options }),
    };
    const replaceSearchParams = createAdminOrdersReplaceSearchParams(
      router,
      new URLSearchParams(
        "datePreset=today&dateFrom=2026-01-01&dateTo=2026-01-31&cursor=abc",
      ) as unknown as import("next/navigation").ReadonlyURLSearchParams,
    );
    const mutators = createAdminOrdersFilterMutators(replaceSearchParams);

    mutators.setDateFromInput("");

    const next = new URL(calls[0]!.href, "https://example.test").searchParams;
    expect(next.has("dateFrom")).toBe(false);
    expect(next.get("dateTo")).toBe("2026-01-31");
    expect(next.has("datePreset")).toBe(false);
    expect(next.has("cursor")).toBe(false);
  });

  it("integration: setDateToInput('') removes dateTo, clears preset, resets cursor", () => {
    const calls: Array<{ href: string; options?: { scroll?: boolean } }> = [];
    const router: AdminOrdersListRouter = {
      replace: (href, options) => calls.push({ href, options }),
    };
    const replaceSearchParams = createAdminOrdersReplaceSearchParams(
      router,
      new URLSearchParams(
        "datePreset=7d&dateFrom=2026-01-01&dateTo=2026-01-31&cursor=abc",
      ) as unknown as import("next/navigation").ReadonlyURLSearchParams,
    );
    const mutators = createAdminOrdersFilterMutators(replaceSearchParams);

    mutators.setDateToInput("");

    const next = new URL(calls[0]!.href, "https://example.test").searchParams;
    expect(next.get("dateFrom")).toBe("2026-01-01");
    expect(next.has("dateTo")).toBe(false);
    expect(next.has("datePreset")).toBe(false);
    expect(next.has("cursor")).toBe(false);
  });
});
