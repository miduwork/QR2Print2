import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tổng quan",
};

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
