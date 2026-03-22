import { formPrimaryButtonClass } from "./formStyles";

type Props = {
  loading: boolean;
};

export function SubmitButton({ loading }: Props) {
  return (
    <button
      type="submit"
      disabled={loading}
      className={formPrimaryButtonClass}
    >
      {loading ? "Đang gửi..." : "Gửi đơn"}
    </button>
  );
}
