import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cài đặt",
};

export default function AdminSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
