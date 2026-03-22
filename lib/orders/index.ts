/**
 * API công khai gọn cho phần UI import từ `@/lib/orders`.
 * Logic nội bộ (createOrder, repository, …) import trực tiếp file con.
 */
export type { Order, OrderInsert } from "./types";
export { ORDER_PRIORITY, ORDER_STATUS } from "./types";
export {
  PRINT_COLOR_LABEL,
  PRINT_SIDES_LABEL,
  type PrintColor,
  type PrintSides,
} from "./printOptions";
