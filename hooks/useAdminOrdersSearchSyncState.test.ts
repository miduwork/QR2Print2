import { describe, expect, it } from "vitest";
import {
  getNextSearchParamsForDebouncedSearch,
  type AdminOrdersListRouter,
  createAdminOrdersReplaceSearchParams,
} from "@/hooks/useAdminOrdersFiltersState";

describe("useAdminOrdersSearchSyncState (scaffold)", () => {
  it("returns null when debounced query is unchanged", () => {
    const next = getNextSearchParamsForDebouncedSearch("q=alice&cursor=abc", "alice");
    expect(next).toBeNull();
  });

  it("updates q and resets cursor params", () => {
    const next = getNextSearchParamsForDebouncedSearch(
      "q=alice&cursor=abc&cursorStack=a,b",
      "  bob  ",
    );
    expect(next).not.toBeNull();
    expect(next?.get("q")).toBe("bob");
    expect(next?.has("cursor")).toBe(false);
    expect(next?.has("cursorStack")).toBe(false);
  });

  it("deletes q when debounced query becomes empty", () => {
    const next = getNextSearchParamsForDebouncedSearch("q=alice&payment=paid", "   ");
    expect(next?.has("q")).toBe(false);
    expect(next?.get("payment")).toBe("paid");
  });

  it("scaffold: replaceSearchParams builds admin orders URL", () => {
    const calls: Array<{ href: string; options?: { scroll?: boolean } }> = [];
    const router: AdminOrdersListRouter = {
      replace: (href, options) => calls.push({ href, options }),
    };
    const replaceSearchParams = createAdminOrdersReplaceSearchParams(
      router,
      new URLSearchParams("q=test") as unknown as import("next/navigation").ReadonlyURLSearchParams,
    );

    replaceSearchParams((sp) => {
      sp.set("payment", "paid");
    });

    expect(calls).toHaveLength(1);
    expect(calls[0]?.href).toContain("/admin/orders?");
    expect(calls[0]?.href).toContain("q=test");
    expect(calls[0]?.href).toContain("payment=paid");
    expect(calls[0]?.options).toEqual({ scroll: false });
  });
});
