"use client";

import Link from "next/link";
import { useEffect } from "react";
import {
  formPrimaryButtonInlineClass,
  linkAccentClass,
} from "@/components/order-form/formStyles";
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="vi">
      <body className="font-sans antialiased">
        <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-muted px-4 py-12">
          <div className="max-w-md text-center">
            <h1 className="text-xl font-semibold text-foreground">
              Đã xảy ra lỗi nghiêm trọng
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Giao diện không thể hiển thị. Hãy tải lại trang hoặc về trang chủ.
            </p>
            {process.env.NODE_ENV === "development" && (
              <p className="mt-3 break-all text-left text-xs text-danger-foreground">
                {error.message}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => reset()}
              className={formPrimaryButtonInlineClass}
            >
              Thử lại
            </button>
            <Link
              href="/"
              className={`text-sm font-medium ${linkAccentClass}`}
            >
              Về trang chủ
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
