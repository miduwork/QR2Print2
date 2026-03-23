import { formatDateTime, getRelativeTime } from "@/lib/utils/relativeTime";

/** Nội dung một ô thời gian (bảng desktop): relative + absolute, hoặc — */
export function OrderTimestampStack({ at }: { at: string | null | undefined }) {
  if (!at) {
    return <span className="text-placeholder">—</span>;
  }
  return (
    <>
      <span className="block text-xs">{getRelativeTime(at)}</span>
      <span className="block text-xs opacity-80">{formatDateTime(at)}</span>
    </>
  );
}
