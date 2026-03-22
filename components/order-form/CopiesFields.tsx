import { inputClass, labelClass } from "./formStyles";

type Props = {
  copiesInput: string;
  totalPrice: number | null;
  onCopiesChange: (v: string) => void;
  disabled: boolean;
};

export function CopiesFields({
  copiesInput,
  totalPrice,
  onCopiesChange,
  disabled,
}: Props) {
  return (
    <div>
      <label htmlFor="copies" className={labelClass}>
        Số bản in
      </label>
      <input
        id="copies"
        type="number"
        min={1}
        max={999}
        value={copiesInput}
        onChange={(e) =>
          onCopiesChange(
            e.target.value.replace(/\D/g, "").slice(0, 3) || "1",
          )
        }
        placeholder="Nhập số bản in (mặc định 1)"
        className={inputClass}
        disabled={disabled}
      />
      {totalPrice != null && totalPrice > 0 && (
        <p className="mt-1.5 text-sm font-medium text-primary-foreground">
          Tổng cộng: {totalPrice.toLocaleString("vi-VN")} VNĐ
        </p>
      )}
    </div>
  );
}
