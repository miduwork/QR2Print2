import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đơn hàng",
};

export default function AdminOrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
