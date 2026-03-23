/**
 * API công khai cho UI: import từ `@/lib/orders` (types, print options, printJobSpec).
 * Logic nội bộ (createOrder, repository, …) có thể import trực tiếp file con.
 */
export type { Order, OrderInsert } from "./types";
export { ORDER_PRIORITY, ORDER_STATUS } from "./types";
export {
  PRINT_COLOR_LABEL,
  PRINT_SIDES_LABEL,
  type PrintColor,
  type PrintSides,
} from "./printOptions";
export * from "./printJobSpec";
