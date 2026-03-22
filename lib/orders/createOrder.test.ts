import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/config/public", () => ({
  publicConfig: {
    supabaseUrl: "",
    supabaseAnonKey: "",
    pricePerPage: 500,
    vietqr: { bankId: "MB", accountNo: "1" },
  },
}));

vi.mock("@/lib/config/business", () => ({
  FREESHIP_THRESHOLD_VND: 200_000,
  PICKUP_ADDRESS_DISPLAY: "",
  getFreeshipHintText: () => "",
}));

import { buildOrderPayload, validateOrderForm } from "./createOrder";

function baseSnapshot() {
  return {
    customerName: "Nguyễn A",
    phone: "0909123456",
    note: "",
    copiesInput: "2",
    pageCountInput: "5",
    deliveryMethod: "pickup" as const,
    deliveryDistrict: "Phường Tam Thắng",
    deliveryDetail: "123 Đường X",
    printColor: "bw" as const,
    printSides: "double" as const,
  };
}

describe("validateOrderForm", () => {
  it("fails when customer name empty", () => {
    const snap = { ...baseSnapshot(), customerName: "   " };
    const r = validateOrderForm(snap, new File([], "a.pdf"));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.message).toMatch(/tên khách hàng/);
  });

  it("fails when no file", () => {
    const r = validateOrderForm(baseSnapshot(), null);
    expect(r.ok).toBe(false);
  });

  it("succeeds with valid pickup order", () => {
    const r = validateOrderForm(
      baseSnapshot(),
      new File([], "a.pdf"),
    );
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.copies).toBe(2);
  });

  it("requires delivery fields when delivery selected", () => {
    const snap = {
      ...baseSnapshot(),
      deliveryMethod: "delivery" as const,
      deliveryDetail: "",
    };
    const r = validateOrderForm(snap, new File([], "a.pdf"));
    expect(r.ok).toBe(false);
  });
});

describe("buildOrderPayload", () => {
  it("computes totals and pickup address null", () => {
    const row = buildOrderPayload({
      id: "00000000-0000-4000-8000-000000000001",
      customerName: " A ",
      phone: " 0909 ",
      note: " x ",
      fileName: "f.pdf",
      fileUrl: "https://example.com/f.pdf",
      totalPages: 10,
      copies: 2,
      deliveryMethod: "pickup",
      deliveryDetail: "d",
      deliveryDistrict: "w",
      printColor: "bw",
      printSides: "double",
    });
    expect(row.total_price).toBe(10_000);
    expect(row.shipping_fee).toBe(0);
    expect(row.delivery_address).toBeNull();
    expect(row.page_count).toBe(10);
    expect(row.copies).toBe(2);
  });

  it("builds delivery address from city + district + detail", () => {
    const row = buildOrderPayload({
      id: "00000000-0000-4000-8000-000000000002",
      customerName: "B",
      phone: "1",
      note: "",
      fileName: "f.pdf",
      fileUrl: "https://example.com/f.pdf",
      totalPages: 4,
      copies: 1,
      deliveryMethod: "delivery",
      deliveryDetail: "Số 1",
      deliveryDistrict: "Phường X",
      printColor: "color",
      printSides: "single",
    });
    expect(row.delivery_method).toBe("delivery");
    expect(row.delivery_address).toContain("Số 1");
    expect(row.delivery_address).toContain("Phường X");
    expect(row.shipping_fee).toBe(20_000);
    expect(row.total_price).toBe(2000 + 20_000);
  });
});
