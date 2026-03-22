import { FREESHIP_THRESHOLD_VND } from "@/lib/config/business";
import { publicConfig } from "@/lib/config/public";
import type { DeliveryMethod } from "@/lib/orders/delivery";
import { getShippingFee } from "@/lib/orders/delivery";

export function getPricePerPage(): number {
  return publicConfig.pricePerPage;
}

export function calculateTotal(pages: number, copies: number = 1): number {
  if (!Number.isFinite(pages) || pages <= 0) return 0;
  if (!Number.isFinite(copies) || copies <= 0) copies = 1;
  return pages * copies * getPricePerPage();
}

export function calculateGrandTotal(
  pages: number,
  copies: number,
  deliveryMethod: DeliveryMethod,
): { printSubtotal: number; shippingFee: number; total: number } {
  const printSubtotal = calculateTotal(pages, copies);
  let shippingFee = getShippingFee(deliveryMethod);

  if (printSubtotal >= FREESHIP_THRESHOLD_VND) {
    shippingFee = 0;
  }
  return {
    printSubtotal,
    shippingFee,
    total: printSubtotal + shippingFee,
  };
}

