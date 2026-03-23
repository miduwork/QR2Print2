import {
  formatOrderSpecSummary,
  isOrderSpecV1,
} from "@/lib/orders/printJobSpec";
import { PRINT_COLOR_LABEL, PRINT_SIDES_LABEL } from "@/lib/orders/printOptions";
import type { Order } from "@/lib/orders/types";

/** Một dòng: loại in (màu · mặt) hoặc tóm tắt từ order_spec. */
export function OrderPrintSpec({ order }: { order: Order }) {
  return (
    <>
      {order.order_spec != null && isOrderSpecV1(order.order_spec) ? (
        <span className="block max-w-[min(100%,240px)] whitespace-normal text-left">
          {formatOrderSpecSummary(order.order_spec, {
            printColor: order.print_color,
            printSides: order.print_sides,
          })}
        </span>
      ) : (
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
      )}
    </>
  );
}
