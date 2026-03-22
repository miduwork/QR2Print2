"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  authFooterNoteClass,
  authShellClass,
  authSubtitleClass,
  authTitleClass,
  formCardClass,
  formErrorAlertClass,
  formPrimaryButtonClass,
  inputClass,
  labelClass,
} from "@/components/order-form/formStyles";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setStatus("error");
      setMessage("Vui lòng nhập email và mật khẩu.");
      return;
    }

    setStatus("loading");
    setMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setStatus("error");
      setMessage(error.message === "Invalid login credentials" ? "Email hoặc mật khẩu không đúng." : error.message);
      return;
    }

    router.push(next);
    router.refresh();
  };

  const inputDisabledClass = `${inputClass} disabled:opacity-60`;

  return (
    <main className={authShellClass}>
      <div className="w-full max-w-sm">
        <div className={formCardClass}>
          <h1 className={authTitleClass}>Đăng nhập Admin</h1>
          <p className={authSubtitleClass}>
            QR2Print · Quản lý đơn hàng
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="email"
                className={labelClass}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                autoComplete="email"
                className={inputDisabledClass}
                disabled={status === "loading"}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className={labelClass}
              >
                Mật khẩu
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className={inputDisabledClass}
                disabled={status === "loading"}
              />
            </div>

            {message && (
              <div role="alert" className={formErrorAlertClass}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className={formPrimaryButtonClass}
            >
              {status === "loading" ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>
        </div>

        <p className={authFooterNoteClass}>
          Chỉ tài khoản Admin được cấp quyền.
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className={authShellClass}>
        <div className="h-8 w-48 animate-pulse rounded-full bg-border" />
      </main>
    }>
      <LoginForm />
    </Suspense>
  );
}
