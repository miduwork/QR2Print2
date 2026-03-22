import { PRINT_COLOR_LABEL, PRINT_SIDES_LABEL } from "@/lib/orders";
import type { Order } from "@/lib/orders/types";

/** Một dòng: loại in (màu · mặt). */
export function OrderPrintSpec({ order }: { order: Order }) {
  return (
    <>
      {
        PRINT_COLOR_LABEL[
          (order.print_color ?? "bw") as keyof typeof PRINT_COLOR_LABEL
        ]
      }{" "}
      ·{" "}
      {
        PRINT_SIDES_LABEL[
          (order.print_sides ?? "double") as keyof typeof PRINT_SIDES_LABEL
        ]
      }
    </>
  );
}
