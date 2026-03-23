import { linkAccentClass } from "@/components/admin/adminStyles";

type Props = {
  fileUrl: string | null | undefined;
  fileName?: string | null;
  /** compact: "Xem" / "Tải"; verbose: "Xem file" / "Tải" (mobile). */
  variant?: "compact" | "verbose";
  linkClassName?: string;
  wrapperClassName?: string;
};

const defaultLinkClass = linkAccentClass;

export function OrderFileLinks({
  fileUrl,
  fileName,
  variant = "compact",
  linkClassName = defaultLinkClass,
  wrapperClassName = "flex gap-1",
}: Props) {
  if (!fileUrl) {
    return <span className="text-placeholder">—</span>;
  }

  const viewLabel = variant === "verbose" ? "Xem file" : "Xem";

  return (
    <span className={wrapperClassName}>
      <a
        href={fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClassName}
      >
        {viewLabel}
      </a>
      <a
        href={fileUrl}
        download={fileName ?? undefined}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClassName}
      >
        Tải
      </a>
    </span>
  );
}
