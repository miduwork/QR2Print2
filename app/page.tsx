import { HomeOrderForm } from "@/components/home/HomeOrderForm";
import {
  formPageContentMaxLgClass,
  formPageFooterNoteClass,
  formPageShellClass,
  formPageSubtitleClass,
  formPageTitleClass,
} from "@/components/order-form/formStyles";

export default function Home() {
  return (
    <main className={formPageShellClass}>
      <div className={formPageContentMaxLgClass}>
        <header className="mb-8 text-center">
          <h1 className={formPageTitleClass}>QR2Print</h1>
          <p className={formPageSubtitleClass}>
            Quét mã QR · Gửi file · In nhanh
          </p>
        </header>

        <HomeOrderForm />

        <p className={formPageFooterNoteClass}>
          Thông tin của bạn được bảo mật và chỉ dùng để xử lý đơn in.
        </p>
      </div>
    </main>
  );
}
