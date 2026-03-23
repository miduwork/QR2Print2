import { describe, expect, it } from "vitest";
import { resolveAdaptivePollIntervalMs } from "@/hooks/useAdaptivePolling";

describe("resolveAdaptivePollIntervalMs", () => {
  it("keeps base interval when streak <= 0", () => {
    expect(resolveAdaptivePollIntervalMs(45_000, 0)).toBe(45_000);
    expect(resolveAdaptivePollIntervalMs(45_000, -1)).toBe(45_000);
  });

  it("backs off 45s -> 90s -> 180s", () => {
    expect(resolveAdaptivePollIntervalMs(45_000, 1)).toBe(90_000);
    expect(resolveAdaptivePollIntervalMs(45_000, 2)).toBe(180_000);
  });

  it("resets to base when streak returns to 0", () => {
    expect(resolveAdaptivePollIntervalMs(90_000, 0)).toBe(90_000);
    expect(resolveAdaptivePollIntervalMs(90_000, 1)).toBe(180_000);
    expect(resolveAdaptivePollIntervalMs(90_000, 0)).toBe(90_000);
  });

  it("caps at max interval", () => {
    expect(resolveAdaptivePollIntervalMs(90_000, 2)).toBe(180_000);
    expect(resolveAdaptivePollIntervalMs(30_000, 10, 120_000)).toBe(120_000);
  });
});
