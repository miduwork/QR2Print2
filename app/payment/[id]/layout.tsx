/** Trang thanh toán theo id — luôn dynamic, tránh dev worker đọc manifest SSG lỗi. */
export const dynamic = "force-dynamic";

export default function PaymentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
