import {
  formRequiredMarkClass,
  inputClass,
  labelClass,
  textareaClass,
} from "./formStyles";

type Props = {
  customerName: string;
  phone: string;
  onCustomerNameChange: (v: string) => void;
  onPhoneChange: (v: string) => void;
  disabled: boolean;
};

export function CustomerFields({
  customerName,
  phone,
  onCustomerNameChange,
  onPhoneChange,
  disabled,
}: Props) {
  return (
    <>
      <div>
        <label htmlFor="name" className={labelClass}>
          Tên khách hàng <span className={formRequiredMarkClass}>*</span>
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
          Số điện thoại <span className={formRequiredMarkClass}>*</span>
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
    </>
  );
}

type NoteProps = {
  note: string;
  onNoteChange: (v: string) => void;
  disabled: boolean;
};

export function CustomerNoteField({ note, onNoteChange, disabled }: NoteProps) {
  return (
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
  );
}
