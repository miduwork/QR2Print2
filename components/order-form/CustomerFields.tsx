import { inputClass, labelClass, textareaClass } from "./formStyles";

type Props = {
  customerName: string;
  phone: string;
  note: string;
  onCustomerNameChange: (v: string) => void;
  onPhoneChange: (v: string) => void;
  onNoteChange: (v: string) => void;
  disabled: boolean;
};

export function CustomerFields({
  customerName,
  phone,
  note,
  onCustomerNameChange,
  onPhoneChange,
  onNoteChange,
  disabled,
}: Props) {
  return (
    <>
      <div>
        <label htmlFor="name" className={labelClass}>
          Tên khách hàng <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          type="text"
          value={customerName}
          onChange={(e) => onCustomerNameChange(e.target.value)}
          placeholder="Nguyễn Văn A"
          className={inputClass}
          disabled={disabled}
          autoComplete="name"
        />
      </div>

      <div>
        <label htmlFor="phone" className={labelClass}>
          Số điện thoại <span className="text-red-500">*</span>
        </label>
        <input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          placeholder="0900 123 456"
          className={inputClass}
          disabled={disabled}
          autoComplete="tel"
        />
      </div>

      <div>
        <label htmlFor="note" className={labelClass}>
          Ghi chú
        </label>
        <textarea
          id="note"
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder="Yêu cầu in màu, giao hàng trước 17h..."
          rows={3}
          className={textareaClass}
          disabled={disabled}
        />
      </div>
    </>
  );
}
