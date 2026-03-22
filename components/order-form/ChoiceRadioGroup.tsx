"use client";

import { useCallback, useId, type ReactNode } from "react";
import { choiceButtonClass, sectionLabelClass } from "./formStyles";

export type ChoiceRadioGroupProps<T extends string> = {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  getOptionLabel: (value: T) => string;
  disabled?: boolean;
  /** Nội dung phụ dưới nhóm (gợi ý, mô tả). */
  hint?: ReactNode;
  /** Class cho nhãn nhóm (mặc định giống section form). */
  labelClassName?: string;
};

export function ChoiceRadioGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  getOptionLabel,
  disabled = false,
  hint,
  labelClassName = sectionLabelClass,
}: ChoiceRadioGroupProps<T>) {
  const baseId = useId();
  const labelId = `${baseId}-legend`;

  const moveToIndex = useCallback(
    (index: number) => {
      const len = options.length;
      if (len === 0) return;
      const i = ((index % len) + len) % len;
      onChange(options[i]);
    },
    [onChange, options],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
          e.preventDefault();
          moveToIndex(index + 1);
          break;
        case "ArrowLeft":
        case "ArrowUp":
          e.preventDefault();
          moveToIndex(index - 1);
          break;
        case "Home":
          e.preventDefault();
          onChange(options[0]);
          break;
        case "End":
          e.preventDefault();
          onChange(options[options.length - 1]);
          break;
        default:
          break;
      }
    },
    [moveToIndex, onChange, options],
  );

  return (
    <div>
      <p id={labelId} className={labelClassName}>
        {label}
      </p>
      <div
        role="radiogroup"
        aria-labelledby={labelId}
        className="grid grid-cols-2 gap-2"
      >
        {/* Roving tabindex (ARIA APG radio): một tab stop trong nhóm; tabIndex 0/-1 + phím mũi tên/Home/End. */}
        {options.map((opt, index) => {
          const selected = value === opt;
          return (
            <button
              key={opt}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={selected ? 0 : -1}
              disabled={disabled}
              className={choiceButtonClass(selected)}
              onClick={() => onChange(opt)}
              onKeyDown={(e) => handleKeyDown(e, index)}
            >
              {getOptionLabel(opt)}
            </button>
          );
        })}
      </div>
      {hint}
    </div>
  );
}
