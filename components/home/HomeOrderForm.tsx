"use client";

import {
  CustomerFields,
  CustomerNoteField,
} from "@/components/order-form/CustomerFields";
import { DeliverySection } from "@/components/order-form/DeliverySection";
import { FileUploadField } from "@/components/order-form/FileUploadField";
import { FormAlert } from "@/components/order-form/FormAlert";
import { PrintJobTabs } from "@/components/order-form/PrintJobTabs";
import { formSectionCardClass, formSectionHeadingClass } from "@/components/order-form/formStyles";
import { SubmitButton } from "@/components/order-form/SubmitButton";
import {
  DELIVERY_CITY,
  DELIVERY_WARDS,
  getFreeshipHintText,
} from "@/lib/config/orderForm";
import { SHIPPING_FEE_DELIVERY } from "@/lib/orders/delivery";
import { useCreateOrderForm } from "@/hooks/useCreateOrderForm";

export function HomeOrderForm() {
  const f = useCreateOrderForm();

  return (
    <section className={formSectionCardClass}>
      <h2 className={formSectionHeadingClass}>Thông tin đơn in</h2>

      <form onSubmit={f.handleSubmit} className="space-y-4">
        <CustomerFields
          customerName={f.customerName}
          phone={f.phone}
          onCustomerNameChange={f.setCustomerName}
          onPhoneChange={f.setPhone}
          disabled={f.loading}
        />

        <DeliverySection
          deliveryMethod={f.deliveryMethod}
          deliveryDistrict={f.deliveryDistrict}
          deliveryDetail={f.deliveryDetail}
          onDeliveryMethodChange={f.setDeliveryMethod}
          onDeliveryDistrictChange={f.setDeliveryDistrict}
          onDeliveryDetailChange={f.setDeliveryDetail}
          disabled={f.loading}
          deliveryCity={
            f.publicConfigStatus === "ok" && f.publicAppConfig
              ? f.publicAppConfig.delivery.city
              : DELIVERY_CITY
          }
          wards={
            f.publicConfigStatus === "ok" && f.publicAppConfig
              ? f.publicAppConfig.delivery.wards
              : DELIVERY_WARDS
          }
          shippingFeeDelivery={
            f.publicConfigStatus === "ok" && f.publicAppConfig
              ? f.publicAppConfig.delivery.shippingFeeDelivery
              : SHIPPING_FEE_DELIVERY
          }
          freeshipHint={
            f.publicConfigStatus === "ok" && f.publicAppConfig
              ? f.publicAppConfig.delivery.hint
              : getFreeshipHintText()
          }
        />

        <CustomerNoteField
          note={f.note}
          onNoteChange={f.setNote}
          disabled={f.loading}
        />

        <FileUploadField
          file={f.file}
          onFileChange={f.handleFileChange}
          disabled={f.loading}
        />

        <PrintJobTabs
          formCatalog={
            f.publicConfigStatus === "ok" && f.publicAppConfig
              ? f.publicAppConfig.catalog
              : undefined
          }
          hasFile={!!f.file}
          disabled={f.loading}
          printJobKind={f.printJobKind}
          onPrintJobKindChange={f.setPrintJobKind}
          copiesInput={f.copiesInput}
          onCopiesChange={f.setCopiesInput}
          totalPrice={f.totalPrice}
          printColor={f.printColor}
          printSides={f.printSides}
          onPrintColorChange={f.setPrintColor}
          onPrintSidesChange={f.setPrintSides}
          pageCountInput={f.pageCountInput}
          onPageCountChange={f.setPageCountInput}
          docPaperSize={f.docPaperSize}
          docPaperGsm={f.docPaperGsm}
          docPageScope={f.docPageScope}
          docRangeFrom={f.docRangeFrom}
          docRangeTo={f.docRangeTo}
          onDocPaperSizeChange={f.setDocPaperSize}
          onDocPaperGsmChange={f.setDocPaperGsm}
          onDocPageScopeChange={f.setDocPageScope}
          onDocRangeFromChange={f.setDocRangeFrom}
          onDocRangeToChange={f.setDocRangeTo}
          bookPaperSize={f.bookPaperSize}
          bookBodyPages={f.bookBodyPages}
          bookBodyGsm={f.bookBodyGsm}
          bookBodyColor={f.bookBodyColor}
          bookBodySides={f.bookBodySides}
          bookCoverPages={f.bookCoverPages}
          bookCoverGsm={f.bookCoverGsm}
          bookCoverColor={f.bookCoverColor}
          bookBinding={f.bookBinding}
          onBookPaperSizeChange={f.setBookPaperSize}
          onBookBodyPagesChange={f.setBookBodyPages}
          onBookBodyGsmChange={f.setBookBodyGsm}
          onBookBodyColorChange={f.setBookBodyColor}
          onBookBodySidesChange={f.setBookBodySides}
          onBookCoverPagesChange={f.setBookCoverPages}
          onBookCoverGsmChange={f.setBookCoverGsm}
          onBookCoverColorChange={f.setBookCoverColor}
          onBookBindingChange={f.setBookBinding}
          fileNameHint={f.file?.name}
        />

        <FormAlert status={f.status} message={f.message} />

        <SubmitButton loading={f.loading} />
      </form>
    </section>
  );
}
