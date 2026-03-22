import { MAX_FILE_SIZE_MB } from "@/lib/config/orderForm";

export function formatFileTooLargeMessage(
  file: File,
  maxMb: number = MAX_FILE_SIZE_MB,
): string {
  return `File quá lớn. Vui lòng chọn file dưới ${maxMb}MB (hiện tại ~${(
    file.size /
    (1024 * 1024)
  ).toFixed(1)}MB).`;
}
