import { Spinner } from "@/components/feedback/Spinner";
import {
  formErrorAlertClass,
  formNeutralAlertClass,
  formSuccessAlertClass,
} from "./formStyles";

type FormStatus = "idle" | "loading" | "success" | "error";

type Props = {
  status: FormStatus;
  message: string;
};

function alertClassForStatus(status: FormStatus): string {
  if (status === "success") return formSuccessAlertClass;
  if (status === "error") return formErrorAlertClass;
  return formNeutralAlertClass;
}

export function FormAlert({ status, message }: Props) {
  if (!message) return null;

  return (
    <div role="alert" className={alertClassForStatus(status)}>
      {status === "loading" && <Spinner size="sm" />}
      {message}
    </div>
  );
}
