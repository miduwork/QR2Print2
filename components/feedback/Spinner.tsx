import {
  adminPageSpinnerClass,
  formAlertSpinnerClass,
} from "@/components/order-form/formStyles";

type Props = {
  className?: string;
  /** sm: cạnh text (FormAlert); md: khối loading admin */
  size?: "sm" | "md";
};

export function Spinner({ className, size = "sm" }: Props) {
  const base = size === "md" ? adminPageSpinnerClass : formAlertSpinnerClass;
  return (
    <span
      className={[base, className].filter(Boolean).join(" ")}
      aria-hidden
    />
  );
}
