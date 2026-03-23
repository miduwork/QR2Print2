"use client";

import {
  choiceButtonClass,
  segmentedControlGrid3Class,
  segmentedControlGrid4Class,
  segmentedControlGridClass,
} from "./formStyles";

const GRID_BY_COLUMNS: Record<2 | 3 | 4, string> = {
  2: segmentedControlGridClass,
  3: segmentedControlGrid3Class,
  4: segmentedControlGrid4Class,
};

export type SegmentedControlProps<T extends string> = {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  getOptionLabel: (value: T) => string;
  disabled?: boolean;
  /** Số cột lưới (2–4). Mặc định 2. */
  columns?: 2 | 3 | 4;
  /** `tablist` + `tab`: phù hợp chuyển khối nội dung; `group`: nhóm nút chọn độc lập. */
  mode?: "tabs" | "group";
  /** aria-label cho vùng nút */
  ariaLabel: string;
};

/**
 * Nút segment 2–N lựa chọn, cùng style với `choiceButtonClass`.
 * Tách khỏi form cụ thể để tái dùng (loại in, bộ lọc, v.v.).
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  getOptionLabel,
  disabled = false,
  columns = 2,
  mode = "tabs",
  ariaLabel,
}: SegmentedControlProps<T>) {
  const gridClass = GRID_BY_COLUMNS[columns];
  const containerRole = mode === "tabs" ? "tablist" : "group";
  const buttonRole = mode === "tabs" ? "tab" : undefined;

  return (
    <div
      className={gridClass}
      role={containerRole}
      aria-label={ariaLabel}
    >
      {options.map((opt) => {
        const selected = value === opt;
        return (
          <button
            key={opt}
            type="button"
            role={buttonRole}
            aria-selected={mode === "tabs" ? selected : undefined}
            aria-pressed={mode === "group" ? selected : undefined}
            disabled={disabled}
            onClick={() => onChange(opt)}
            className={choiceButtonClass(selected)}
          >
            {getOptionLabel(opt)}
          </button>
        );
      })}
    </div>
  );
}
