"use client";

import type {
  BindingType,
  PageScope,
  PrintJobKind,
} from "@/lib/orders/printJobSpec";
import {
  BINDING_LABEL,
  BINDING_OPTIONS,
  PAPER_GSM_OPTIONS,
  PAPER_SIZES,
  PRINT_JOB_KIND_LABEL,
  PRINT_JOB_KIND_OPTIONS,
} from "@/lib/orders/printJobSpec";
import type { PrintColor, PrintSides } from "@/lib/orders/printOptions";
import {
  PRINT_COLOR_LABEL,
  PRINT_SIDES_LABEL,
} from "@/lib/orders/printOptions";
import { ChoiceRadioGroup } from "./ChoiceRadioGroup";
import { CopiesFields } from "./CopiesFields";
import { PrintOptions } from "./PrintOptions";
import { SegmentedControl } from "./SegmentedControl";
import {
  formFieldHintClass,
  formFieldHintTextClass,
  formNestedPanelClass,
  formSubsectionTitleClass,
  inputClass,
  labelClass,
  sectionLabelClass,
  selectClass,
} from "./formStyles";

const PRINT_COLORS = Object.keys(PRINT_COLOR_LABEL) as PrintColor[];
const PRINT_SIDES = Object.keys(PRINT_SIDES_LABEL) as PrintSides[];
type Props = {
  hasFile: boolean;
  disabled: boolean;
  printJobKind: PrintJobKind;
  onPrintJobKindChange: (k: PrintJobKind) => void;
  copiesInput: string;
  onCopiesChange: (v: string) => void;
  totalPrice: number | null;
  printColor: PrintColor;
  printSides: PrintSides;
  onPrintColorChange: (c: PrintColor) => void;
  onPrintSidesChange: (s: PrintSides) => void;
  pageCountInput: string;
  onPageCountChange: (v: string) => void;
  docPaperSize: string;
  docPaperGsm: string;
  docPageScope: PageScope;
  docRangeFrom: string;
  docRangeTo: string;
  onDocPaperSizeChange: (v: string) => void;
  onDocPaperGsmChange: (v: string) => void;
  onDocPageScopeChange: (s: PageScope) => void;
  onDocRangeFromChange: (v: string) => void;
  onDocRangeToChange: (v: string) => void;
  bookPaperSize: string;
  bookBodyPages: string;
  bookBodyGsm: string;
  bookBodyColor: PrintColor;
  bookBodySides: PrintSides;
  bookCoverPages: string;
  bookCoverGsm: string;
  bookCoverColor: PrintColor;
  bookBinding: BindingType;
  onBookPaperSizeChange: (v: string) => void;
  onBookBodyPagesChange: (v: string) => void;
  onBookBodyGsmChange: (v: string) => void;
  onBookBodyColorChange: (c: PrintColor) => void;
  onBookBodySidesChange: (s: PrintSides) => void;
  onBookCoverPagesChange: (v: string) => void;
  onBookCoverGsmChange: (v: string) => void;
  onBookCoverColorChange: (c: PrintColor) => void;
  onBookBindingChange: (b: BindingType) => void;
  fileNameHint?: string;
  /** Từ GET /api/public/config — mặc định hằng số printJobSpec. */
  formCatalog?: {
    paperSizes: readonly string[];
    gsmOptions: readonly string[];
    bindingOptions: readonly { value: string; label: string }[];
    printJobKindOptions: readonly { value: string; label: string }[];
  };
};

export function PrintJobTabs(props: Props) {
  const {
    hasFile,
    disabled,
    printJobKind,
    onPrintJobKindChange,
    copiesInput,
    onCopiesChange,
    totalPrice,
    printColor,
    printSides,
    onPrintColorChange,
    onPrintSidesChange,
    pageCountInput,
    onPageCountChange,
    docPaperSize,
    docPaperGsm,
    docPageScope,
    docRangeFrom,
    docRangeTo,
    onDocPaperSizeChange,
    onDocPaperGsmChange,
    onDocPageScopeChange,
    onDocRangeFromChange,
    onDocRangeToChange,
    bookPaperSize,
    bookBodyPages,
    bookBodyGsm,
    bookBodyColor,
    bookBodySides,
    bookCoverPages,
    bookCoverGsm,
    bookCoverColor,
    bookBinding,
    onBookPaperSizeChange,
    onBookBodyPagesChange,
    onBookBodyGsmChange,
    onBookBodyColorChange,
    onBookBodySidesChange,
    onBookCoverPagesChange,
    onBookCoverGsmChange,
    onBookCoverColorChange,
    onBookBindingChange,
    fileNameHint,
    formCatalog,
  } = props;

  const paperSizes = formCatalog?.paperSizes ?? PAPER_SIZES;
  const gsmOptions = formCatalog?.gsmOptions ?? PAPER_GSM_OPTIONS;
  const jobKindOpts =
    formCatalog?.printJobKindOptions ??
    PRINT_JOB_KIND_OPTIONS.map((value) => ({
      value,
      label: PRINT_JOB_KIND_LABEL[value],
    }));
  const bindingOpts =
    formCatalog?.bindingOptions ??
    BINDING_OPTIONS.map((value) => ({
      value,
      label: BINDING_LABEL[value],
    }));

  /** Chỉ khi đang gửi đơn — không khóa tab loại in khi chưa chọn file. */
  const loading = disabled;
  /** Khóa ô tùy chọn in khi chưa có file hoặc đang gửi. */
  const fieldsLocked = loading || !hasFile;
  const isPdf = fileNameHint?.toLowerCase().endsWith(".pdf");

  return (
    <div className="space-y-4">
      <div>
        <p className={sectionLabelClass}>Loại đơn in</p>
        <SegmentedControl
          options={jobKindOpts.map((o) => o.value as PrintJobKind)}
          value={printJobKind}
          onChange={onPrintJobKindChange}
          getOptionLabel={(k) =>
            jobKindOpts.find((o) => o.value === k)?.label ?? PRINT_JOB_KIND_LABEL[k]
          }
          disabled={loading}
          ariaLabel="Chọn loại in"
          mode="tabs"
        />
        {!hasFile && (
          <p className={`mt-2 ${formFieldHintTextClass}`}>
            Có thể chọn loại in trước. Chọn file phía trên để nhập số bản và các tùy chọn in bên dưới.
          </p>
        )}
      </div>

      <CopiesFields
        copiesInput={copiesInput}
        totalPrice={totalPrice}
        onCopiesChange={onCopiesChange}
        disabled={fieldsLocked}
      />

      <div
        role="tabpanel"
        hidden={printJobKind !== "document"}
        className={printJobKind !== "document" ? "hidden" : "space-y-4"}
      >
        <PrintOptions
          printColor={printColor}
          printSides={printSides}
          onPrintColorChange={onPrintColorChange}
          onPrintSidesChange={onPrintSidesChange}
          disabled={fieldsLocked}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="doc-paper-size" className={labelClass}>
              Khổ giấy
            </label>
            <select
              id="doc-paper-size"
              value={docPaperSize}
              onChange={(e) => onDocPaperSizeChange(e.target.value)}
              className={selectClass}
              disabled={fieldsLocked}
            >
              {paperSizes.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="doc-paper-gsm" className={labelClass}>
              Định lượng giấy (gsm)
            </label>
            <select
              id="doc-paper-gsm"
              value={docPaperGsm}
              onChange={(e) => onDocPaperGsmChange(e.target.value)}
              className={selectClass}
              disabled={fieldsLocked}
            >
              {gsmOptions.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
        </div>

        <ChoiceRadioGroup
          label="Phạm vi in"
          options={["all", "range"] as const}
          value={docPageScope}
          onChange={onDocPageScopeChange}
          getOptionLabel={(v) =>
            v === "all" ? "Toàn bộ trang" : "Trang cần in (khoảng)"
          }
          disabled={fieldsLocked}
        />

        {docPageScope === "all" ? (
          <div>
            <label htmlFor="page-count-doc" className={labelClass}>
              Số trang
            </label>
            <input
              id="page-count-doc"
              type="number"
              min={1}
              max={9999}
              value={pageCountInput}
              onChange={(e) =>
                onPageCountChange(
                  e.target.value.replace(/\D/g, "").slice(0, 4),
                )
              }
              placeholder="Nhập số trang hoặc để trống (PDF tự đếm)"
              className={inputClass}
              disabled={fieldsLocked}
            />
            {isPdf && (
              <p className={formFieldHintClass}>
                File PDF: có thể để trống để hệ thống đếm trang khi gửi.
              </p>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="doc-range-from" className={labelClass}>
                Trang đầu
              </label>
              <input
                id="doc-range-from"
                type="number"
                min={1}
                max={9999}
                value={docRangeFrom}
                onChange={(e) =>
                  onDocRangeFromChange(
                    e.target.value.replace(/\D/g, "").slice(0, 4),
                  )
                }
                className={inputClass}
                disabled={fieldsLocked}
              />
            </div>
            <div>
              <label htmlFor="doc-range-to" className={labelClass}>
                Trang cuối
              </label>
              <input
                id="doc-range-to"
                type="number"
                min={1}
                max={9999}
                value={docRangeTo}
                onChange={(e) =>
                  onDocRangeToChange(
                    e.target.value.replace(/\D/g, "").slice(0, 4),
                  )
                }
                className={inputClass}
                disabled={fieldsLocked}
              />
            </div>
          </div>
        )}
      </div>

      <div
        role="tabpanel"
        hidden={printJobKind !== "book"}
        className={printJobKind !== "book" ? "hidden" : "space-y-4"}
      >
        <div>
          <label htmlFor="book-paper-size" className={labelClass}>
            Khổ giấy
          </label>
          <select
            id="book-paper-size"
            value={bookPaperSize}
            onChange={(e) => onBookPaperSizeChange(e.target.value)}
            className={selectClass}
            disabled={fieldsLocked}
          >
            {paperSizes.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <p className={formSubsectionTitleClass}>Ruột</p>
          <div className={formNestedPanelClass}>
            <div>
              <label htmlFor="book-body-pages" className={labelClass}>
                Số trang
              </label>
              <input
                id="book-body-pages"
                type="number"
                min={1}
                max={9999}
                value={bookBodyPages}
                onChange={(e) =>
                  onBookBodyPagesChange(
                    e.target.value.replace(/\D/g, "").slice(0, 4),
                  )
                }
                className={inputClass}
                disabled={fieldsLocked}
              />
            </div>
            <div>
              <label htmlFor="book-body-gsm" className={labelClass}>
                Định lượng giấy (gsm)
              </label>
              <select
                id="book-body-gsm"
                value={bookBodyGsm}
                onChange={(e) => onBookBodyGsmChange(e.target.value)}
                className={selectClass}
                disabled={fieldsLocked}
              >
                {gsmOptions.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <ChoiceRadioGroup
              label="Loại in (ruột)"
              options={PRINT_COLORS}
              value={bookBodyColor}
              onChange={onBookBodyColorChange}
              getOptionLabel={(c) => PRINT_COLOR_LABEL[c]}
              disabled={fieldsLocked}
            />
            <ChoiceRadioGroup
              label="In 2 mặt / 1 mặt (ruột)"
              options={PRINT_SIDES}
              value={bookBodySides}
              onChange={onBookBodySidesChange}
              getOptionLabel={(s) => PRINT_SIDES_LABEL[s]}
              disabled={fieldsLocked}
            />
          </div>
        </div>

        <div>
          <p className={formSubsectionTitleClass}>Bìa</p>
          <div className={formNestedPanelClass}>
            <div>
              <label htmlFor="book-cover-pages" className={labelClass}>
                Số trang
              </label>
              <input
                id="book-cover-pages"
                type="number"
                min={1}
                max={99}
                value={bookCoverPages}
                onChange={(e) =>
                  onBookCoverPagesChange(
                    e.target.value.replace(/\D/g, "").slice(0, 2),
                  )
                }
                placeholder="Ví dụ 2"
                className={inputClass}
                disabled={fieldsLocked}
              />
            </div>
            <div>
              <label htmlFor="book-cover-gsm" className={labelClass}>
                Định lượng giấy (gsm)
              </label>
              <select
                id="book-cover-gsm"
                value={bookCoverGsm}
                onChange={(e) => onBookCoverGsmChange(e.target.value)}
                className={selectClass}
                disabled={fieldsLocked}
              >
                {gsmOptions.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <ChoiceRadioGroup
              label="Loại in (bìa)"
              options={PRINT_COLORS}
              value={bookCoverColor}
              onChange={onBookCoverColorChange}
              getOptionLabel={(c) => PRINT_COLOR_LABEL[c]}
              disabled={fieldsLocked}
            />
          </div>
        </div>

        <ChoiceRadioGroup<BindingType>
          label="Đóng gáy"
          options={bindingOpts.map((b) => b.value as BindingType)}
          value={bookBinding}
          onChange={onBookBindingChange}
          getOptionLabel={(b) =>
            bindingOpts.find((o) => o.value === b)?.label ?? BINDING_LABEL[b]
          }
          disabled={fieldsLocked}
        />
      </div>
    </div>
  );
}
