import type { PrintColor, PrintSides } from "@/lib/orders/printOptions";
import {
  PRINT_COLOR_LABEL,
  PRINT_SIDES_LABEL,
} from "@/lib/orders/printOptions";

/** Loại đơn in (tab form). */
export type PrintJobKind = "document" | "book";

export const PRINT_JOB_KIND_LABEL: Record<PrintJobKind, string> = {
  document: "In tài liệu thường",
  book: "In sách",
};

/** Thứ tự nút segment trên form (thêm loại in: mở rộng mảng + label). */
export const PRINT_JOB_KIND_OPTIONS: readonly PrintJobKind[] = [
  "document",
  "book",
];

/** Khổ giấy phổ biến — có thể mở rộng. */
export const PAPER_SIZES = ["A3", "A4", "A5"] as const;
export type PaperSize = (typeof PAPER_SIZES)[number];

export const PAPER_GSM_OPTIONS = [
  "70",
  "80",
  "100",
  "120",
  "150",
  "200",
  "250",
  "300",
] as const;
export type PaperGsm = (typeof PAPER_GSM_OPTIONS)[number];

export type PageScope = "all" | "range";

export type BindingType = "spring_metal" | "spring_plastic" | "glue";

export const BINDING_LABEL: Record<BindingType, string> = {
  spring_metal: "Lò xo kẽm",
  spring_plastic: "Lò xo nhựa",
  glue: "Keo",
};

/** Thứ tự hiển thị trên form. */
export const BINDING_OPTIONS: BindingType[] = [
  "spring_metal",
  "spring_plastic",
  "glue",
];

/** Snapshot lưu DB (JSON) — phiên bản schema. */
export type OrderSpecV1 =
  | {
      v: 1;
      kind: "document";
      paperSize: string;
      paperGsm: string;
      pageScope: PageScope;
      rangeFrom?: number;
      rangeTo?: number;
    }
  | {
      v: 1;
      kind: "book";
      paperSize: string;
      body: {
        pages: number;
        gsm: string;
        printColor: PrintColor;
        printSides: PrintSides;
      };
      cover: {
        pages: number;
        gsm: string;
        printColor: PrintColor;
      };
      binding: BindingType;
    };

export function isOrderSpecV1(v: unknown): v is OrderSpecV1 {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  if (o.v !== 1) return false;
  return o.kind === "document" || o.kind === "book";
}

/**
 * @param print — với đơn tài liệu: thêm màu/mặt từ cột `print_color` / `print_sides` (không nằm trong JSON order_spec).
 */
export function formatOrderSpecSummary(
  spec: OrderSpecV1,
  print?: { printColor?: PrintColor | null; printSides?: PrintSides | null },
): string {
  if (spec.kind === "document") {
    const scope =
      spec.pageScope === "all"
        ? "Toàn bộ trang"
        : spec.rangeFrom != null && spec.rangeTo != null
          ? `Trang ${spec.rangeFrom}–${spec.rangeTo}`
          : "Một phần trang";
    let line = `${PRINT_JOB_KIND_LABEL.document} · ${spec.paperSize} · ${spec.paperGsm} gsm · ${scope}`;
    const c = print?.printColor;
    const s = print?.printSides;
    if (
      (c === "bw" || c === "color") &&
      (s === "double" || s === "single")
    ) {
      line += ` · ${PRINT_COLOR_LABEL[c]} · ${PRINT_SIDES_LABEL[s]}`;
    }
    return line;
  }
  return `${PRINT_JOB_KIND_LABEL.book} · ${spec.paperSize} · Ruột ${spec.body.pages} tr · Bìa ${spec.cover.pages} tr · ${BINDING_LABEL[spec.binding]}`;
}
