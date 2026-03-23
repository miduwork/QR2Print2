/** Cột có thể bật/tắt (không gồm « Khách hàng » và « Thao tác » — luôn hiển thị). */
export const ADMIN_ORDERS_TOGGLE_COLUMN_IDS = [
  "timestamps",
  "print",
  "note",
  "phone",
  "file",
  "pages",
  "delivery",
  "priority",
  "status",
] as const;

export type AdminOrdersToggleColumnId =
  (typeof ADMIN_ORDERS_TOGGLE_COLUMN_IDS)[number];

export type AdminOrdersColumnVisibility = Record<
  AdminOrdersToggleColumnId,
  boolean
>;

const STORAGE_KEY = "qr2print_admin_orders_columns_v1";

export const ADMIN_ORDERS_COLUMN_LABELS: Record<
  AdminOrdersToggleColumnId,
  string
> = {
  timestamps: "Thời gian (tạo / hoàn thành / giao)",
  print: "In",
  note: "Ghi chú",
  phone: "SĐT",
  file: "File",
  pages: "Trang × Bản",
  delivery: "Nhận hàng",
  priority: "Ưu tiên",
  status: "Trạng thái in",
};

export function defaultAdminOrdersColumnVisibility(): AdminOrdersColumnVisibility {
  return {
    timestamps: true,
    print: true,
    note: true,
    phone: true,
    file: true,
    pages: true,
    delivery: true,
    priority: true,
    status: true,
  };
}

export function loadAdminOrdersColumnVisibility(): AdminOrdersColumnVisibility {
  if (typeof window === "undefined") return defaultAdminOrdersColumnVisibility();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultAdminOrdersColumnVisibility();
    const parsed = JSON.parse(raw) as Partial<AdminOrdersColumnVisibility>;
    const base = defaultAdminOrdersColumnVisibility();
    for (const id of ADMIN_ORDERS_TOGGLE_COLUMN_IDS) {
      if (typeof parsed[id] === "boolean") base[id] = parsed[id]!;
    }
    return base;
  } catch {
    return defaultAdminOrdersColumnVisibility();
  }
}

export function saveAdminOrdersColumnVisibility(
  v: AdminOrdersColumnVisibility,
): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(v));
  } catch {
    /* ignore */
  }
}
