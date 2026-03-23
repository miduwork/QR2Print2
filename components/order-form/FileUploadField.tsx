import type { ChangeEvent } from "react";
import { ACCEPT_FILES } from "@/lib/config/orderForm";
import {
  fileInputClass,
  formFieldHintSpacedClass,
  formRequiredMarkClass,
  labelClass,
} from "./formStyles";

type Props = {
  file: File | null;
  acceptFiles?: string;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
};

export function FileUploadField({
  file,
  acceptFiles = ACCEPT_FILES,
  onFileChange,
  disabled,
}: Props) {
  return (
    <div>
      <label htmlFor="file-input" className={labelClass}>
        File tài liệu (PDF, Word, Ảnh){" "}
        <span className={formRequiredMarkClass}>*</span>
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
        <p className={formFieldHintSpacedClass}>Đã chọn: {file.name}</p>
      )}
    </div>
  );
}
