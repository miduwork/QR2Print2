import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const fontSans = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "QR2Print",
    template: "%s · QR2Print",
  },
  description: "Quét mã QR và in đơn hàng",
  openGraph: {
    title: "QR2Print",
    description: "Quét mã QR và in đơn hàng",
    locale: "vi_VN",
    type: "website",
    siteName: "QR2Print",
    url: siteUrl,
  },
  twitter: {
    card: "summary",
    title: "QR2Print",
    description: "Quét mã QR và in đơn hàng",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={fontSans.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
