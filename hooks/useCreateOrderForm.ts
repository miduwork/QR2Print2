"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import {
  DELIVERY_WARDS,
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_MB,
} from "@/lib/config/orderForm";
import type { DeliveryMethod } from "@/lib/orders/delivery";
import { formatFileTooLargeMessage } from "@/lib/orders/orderForm";
import type { PrintColor, PrintSides } from "@/lib/orders/printOptions";
import { calculateGrandTotal } from "@/lib/payments/pricing";

export type FormStatus = "idle" | "loading" | "success" | "error";

export function useCreateOrderForm() {
  const router = useRouter();

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [pageCountInput, setPageCountInput] = useState("");
  const [copiesInput, setCopiesInput] = useState("1");
  const [deliveryMethod, setDeliveryMethod] =
    useState<DeliveryMethod>("pickup");
  const [printColor, setPrintColor] = useState<PrintColor>("bw");
  const [printSides, setPrintSides] = useState<PrintSides>("double");
  const [deliveryDistrict, setDeliveryDistrict] = useState<string>(
    DELIVERY_WARDS[0],
  );
  const [deliveryDetail, setDeliveryDetail] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState("");

  const pagesParsed = pageCountInput.trim()
    ? parseInt(pageCountInput.trim(), 10)
    : null;
  const copiesParsed = copiesInput.trim()
    ? parseInt(copiesInput.trim(), 10)
    : 1;
  const totalPrice =
    pagesParsed != null &&
    pagesParsed > 0 &&
    copiesParsed > 0
      ? calculateGrandTotal(pagesParsed, copiesParsed, deliveryMethod).total
      : null;

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const chosen = e.target.files?.[0];
      if (!chosen) {
        setFile(null);
        setPageCountInput("");
        setStatus("idle");
        setMessage("");
        return;
      }
      if (chosen.size > MAX_FILE_SIZE_BYTES) {
        setFile(null);
        setPageCountInput("");
        setStatus("error");
        setMessage(formatFileTooLargeMessage(chosen, MAX_FILE_SIZE_MB));
        return;
      }
      setFile(chosen);
      setPageCountInput("");
      setStatus("idle");
      setMessage("");
    },
    [],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!file) {
        setStatus("error");
        setMessage("Vui lòng chọn file tài liệu cần in.");
        return;
      }

      setStatus("loading");
      setMessage("Đang xử lý...");

      try {
        const formData = new FormData();
        formData.set("file", file);
        formData.set("customerName", customerName);
        formData.set("phone", phone);
        formData.set("note", note);
        formData.set("copiesInput", copiesInput);
        formData.set("pageCountInput", pageCountInput);
        formData.set("deliveryMethod", deliveryMethod);
        formData.set("deliveryDistrict", deliveryDistrict);
        formData.set("deliveryDetail", deliveryDetail);
        formData.set("printColor", printColor);
        formData.set("printSides", printSides);

        const res = await fetch("/api/orders", { method: "POST", body: formData });
        const data = (await res.json().catch(() => null)) as {
          error?: string;
          orderId?: string;
        } | null;

        if (!res.ok) {
          setStatus("error");
          setMessage(
            typeof data?.error === "string"
              ? data.error
              : "Không tạo được đơn hàng.",
          );
          return;
        }

        if (typeof data?.orderId !== "string") {
          setStatus("error");
          setMessage("Phản hồi từ server không hợp lệ.");
          return;
        }

        setStatus("success");
        setMessage("Gửi đơn thành công. Đang chuyển đến trang thanh toán...");
        router.push(`/payment/${data.orderId}`);
      } catch (err) {
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Đã xảy ra lỗi.");
      }
    },
    [
      file,
      customerName,
      phone,
      note,
      copiesInput,
      pageCountInput,
      deliveryMethod,
      deliveryDistrict,
      deliveryDetail,
      printColor,
      printSides,
      router,
    ],
  );

  const loading = status === "loading";

  return {
    customerName,
    setCustomerName,
    phone,
    setPhone,
    note,
    setNote,
    file,
    pageCountInput,
    setPageCountInput,
    copiesInput,
    setCopiesInput,
    deliveryMethod,
    setDeliveryMethod,
    printColor,
    setPrintColor,
    printSides,
    setPrintSides,
    deliveryDistrict,
    setDeliveryDistrict,
    deliveryDetail,
    setDeliveryDetail,
    status,
    message,
    totalPrice,
    loading,
    handleFileChange,
    handleSubmit,
  };
}
