"use client";

import { CopiesFields } from "@/components/order-form/CopiesFields";
import { CustomerFields } from "@/components/order-form/CustomerFields";
import { DeliverySection } from "@/components/order-form/DeliverySection";
import { FileAndPageFields } from "@/components/order-form/FileAndPageFields";
import { FormAlert } from "@/components/order-form/FormAlert";
import {
  formPageContentMaxLgClass,
  formPageFooterNoteClass,
  formPageShellClass,
  formPageSubtitleClass,
  formPageTitleClass,
  formSectionCardClass,
  formSectionHeadingClass,
} from "@/components/order-form/formStyles";
import { PrintOptions } from "@/components/order-form/PrintOptions";
import { SubmitButton } from "@/components/order-form/SubmitButton";
import { useCreateOrderForm } from "@/hooks/useCreateOrderForm";

export default function Home() {
  const f = useCreateOrderForm();

  return (
    <main className={formPageShellClass}>
      <div className={formPageContentMaxLgClass}>
        <header className="mb-8 text-center">
          <h1 className={formPageTitleClass}>QR2Print</h1>
          <p className={formPageSubtitleClass}>
            Quét mã QR · Gửi file · In nhanh
          </p>
        </header>

        <section className={formSectionCardClass}>
          <h2 className={formSectionHeadingClass}>
            Thông tin đơn in
          </h2>

          <form onSubmit={f.handleSubmit} className="space-y-4">
            <CustomerFields
              customerName={f.customerName}
              phone={f.phone}
              note={f.note}
              onCustomerNameChange={f.setCustomerName}
              onPhoneChange={f.setPhone}
              onNoteChange={f.setNote}
              disabled={f.loading}
            />

            <FileAndPageFields
              file={f.file}
              pageCountInput={f.pageCountInput}
              onFileChange={f.handleFileChange}
              onPageCountChange={f.setPageCountInput}
              disabled={f.loading}
            />

            <PrintOptions
              printColor={f.printColor}
              printSides={f.printSides}
              onPrintColorChange={f.setPrintColor}
              onPrintSidesChange={f.setPrintSides}
              disabled={f.loading}
            />

            {f.file && (
              <CopiesFields
                copiesInput={f.copiesInput}
                totalPrice={f.totalPrice}
                onCopiesChange={f.setCopiesInput}
                disabled={f.loading}
              />
            )}

            <DeliverySection
              deliveryMethod={f.deliveryMethod}
              deliveryDistrict={f.deliveryDistrict}
              deliveryDetail={f.deliveryDetail}
              onDeliveryMethodChange={f.setDeliveryMethod}
              onDeliveryDistrictChange={f.setDeliveryDistrict}
              onDeliveryDetailChange={f.setDeliveryDetail}
              disabled={f.loading}
            />

            <FormAlert status={f.status} message={f.message} />

            <SubmitButton loading={f.loading} />
          </form>
        </section>

        <p className={formPageFooterNoteClass}>
          Thông tin của bạn được bảo mật và chỉ dùng để xử lý đơn in.
        </p>
      </div>
    </main>
  );
}
