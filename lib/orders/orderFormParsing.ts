import type { DeliveryMethod } from "@/lib/orders/delivery";
import type { OrderFormSnapshot } from "@/lib/orders/createOrder";
import type { PrintColor, PrintSides } from "@/lib/orders/printOptions";

const DELIVERY: DeliveryMethod[] = ["pickup", "delivery"];
const PRINT_COLORS: PrintColor[] = ["bw", "color"];
const PRINT_SIDES: PrintSides[] = ["double", "single"];

function isDeliveryMethod(v: string): v is DeliveryMethod {
  return (DELIVERY as readonly string[]).includes(v);
}

function isPrintColor(v: string): v is PrintColor {
  return (PRINT_COLORS as readonly string[]).includes(v);
}

function isPrintSides(v: string): v is PrintSides {
  return (PRINT_SIDES as readonly string[]).includes(v);
}

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

export type ParsedFormSnapshot =
  | { ok: true; snap: OrderFormSnapshot }
  | { ok: false; message: string };

function buildSnapshot(fields: {
  customerName: string;
  phone: string;
  note: string;
  copiesInput: string;
  pageCountInput: string;
  deliveryMethod: string;
  deliveryDistrict: string;
  deliveryDetail: string;
  printColor: string;
  printSides: string;
}): ParsedFormSnapshot {
  if (!isDeliveryMethod(fields.deliveryMethod)) {
    return { ok: false, message: "Phương thức nhận hàng không hợp lệ." };
  }
  if (!isPrintColor(fields.printColor)) {
    return { ok: false, message: "Tùy chọn màu in không hợp lệ." };
  }
  if (!isPrintSides(fields.printSides)) {
    return { ok: false, message: "Tùy chọn mặt in không hợp lệ." };
  }
  return {
    ok: true,
    snap: {
      customerName: fields.customerName,
      phone: fields.phone,
      note: fields.note,
      copiesInput: fields.copiesInput,
      pageCountInput: fields.pageCountInput,
      deliveryMethod: fields.deliveryMethod,
      deliveryDistrict: fields.deliveryDistrict,
      deliveryDetail: fields.deliveryDetail,
      printColor: fields.printColor,
      printSides: fields.printSides,
    },
  };
}

export function parseOrderSnapshotFromFormData(
  formData: FormData,
): ParsedFormSnapshot {
  return buildSnapshot({
    customerName: str(formData.get("customerName")),
    phone: str(formData.get("phone")),
    note: str(formData.get("note")),
    copiesInput: str(formData.get("copiesInput")),
    pageCountInput: str(formData.get("pageCountInput")),
    deliveryMethod: str(formData.get("deliveryMethod")),
    deliveryDistrict: str(formData.get("deliveryDistrict")),
    deliveryDetail: str(formData.get("deliveryDetail")),
    printColor: str(formData.get("printColor")),
    printSides: str(formData.get("printSides")),
  });
}

export function parseOrderSnapshotFromJson(
  body: Record<string, unknown>,
): ParsedFormSnapshot {
  return buildSnapshot({
    customerName: str(body.customerName),
    phone: str(body.phone),
    note: str(body.note),
    copiesInput: str(body.copiesInput),
    pageCountInput: str(body.pageCountInput),
    deliveryMethod: str(body.deliveryMethod),
    deliveryDistrict: str(body.deliveryDistrict),
    deliveryDetail: str(body.deliveryDetail),
    printColor: str(body.printColor),
    printSides: str(body.printSides),
  });
}
