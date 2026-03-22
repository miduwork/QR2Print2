/** Re-export cổng đơn hàng — có thể import trực tiếp từ @/lib/orders/repository(.server). */
export type {
  GetOrderByIdResult,
  OrderPaymentRow,
} from "@/lib/orders/repository.server";
export { getOrderById } from "@/lib/orders/repository.server";
export {
  listOrdersForAdmin,
  updateOrderForAdmin,
  type AdminOrderPatch,
} from "@/lib/orders/repository";
