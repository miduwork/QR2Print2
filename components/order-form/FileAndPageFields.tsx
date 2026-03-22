import type { ChangeEvent } from "react";
import { ACCEPT_FILES } from "@/lib/config/orderForm";
import { fileInputClass, inputClass, labelClass } from "./formStyles";

type Props = {
  file: File | null;
  pageCountInput: string;
  /** Mặc định từ cấu hình form. */
  acceptFiles?: string;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onPageCountChange: (v: string) => void;
  disabled: boolean;
};

export function FileAndPageFields({
  file,
  pageCountInput,
  acceptFiles = ACCEPT_FILES,
  onFileChange,
  onPageCountChange,
  disabled,
}: Props) {
  return (
    <>
      <div>
        <label className={labelClass}>
          File tài liệu (PDF, Word, Ảnh) <span className="text-red-500">*</span>
        </label>
        <input
          id="file-input"
          type="file"
          accept={acceptFiles}
          onChange={onFileChange}
          className={fileInputClass}
          disabled={disabled}
        />
        {file && (
          <p className="mt-1.5 text-xs text-slate-500">Đã chọn: {file.name}</p>
        )}
      </div>

      {file && (
        <div>
          <label htmlFor="page-count" className={labelClass}>
            Số trang
          </label>
          <input
            id="page-count"
            type="number"
            min={1}
            max={9999}
            value={pageCountInput}
            onChange={(e) =>
              onPageCountChange(e.target.value.replace(/\D/g, "").slice(0, 4))
            }
            placeholder="Nhập số trang tài liệu"
            className={inputClass}
            disabled={disabled}
          />
          {file.name.toLowerCase().endsWith(".pdf") && (
            <p className="mt-1 text-xs text-slate-500">
              File PDF: số trang sẽ được kiểm tra khi gửi đơn.
            </p>
          )}
        </div>
      )}
    </>
  );
}
