"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formSecondaryButtonClass } from "@/components/order-form/formStyles";

export function AdminLogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className={formSecondaryButtonClass}
    >
      Đăng xuất
    </button>
  );
}
