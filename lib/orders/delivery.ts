export type DeliveryMethod = "pickup" | "delivery";

export const DELIVERY_METHOD_LABEL: Record<DeliveryMethod, string> = {
  pickup: "Tự đến lấy",
  delivery: "Giao tận nhà",
};

export const SHIPPING_FEE_DELIVERY = 20_000;

export function getShippingFee(method: DeliveryMethod): number {
  return method === "delivery" ? SHIPPING_FEE_DELIVERY : 0;
}

