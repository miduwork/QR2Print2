import { AdminLogoutButton } from "@/components/AdminLogoutButton";
import {
  adminHeaderClass,
  adminShellClass,
  adminTitleClass,
} from "@/components/order-form/formStyles";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={adminShellClass}>
      <header className={adminHeaderClass}>
        <div className="mx-auto flex w-full items-center justify-between px-4">
          <h1 className={adminTitleClass}>QR2Print · Admin</h1>
          <AdminLogoutButton />
        </div>
      </header>
      {children}
    </div>
  );
}
