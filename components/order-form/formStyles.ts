/** className dùng chung cho form đặt hàng + đăng nhập (semantic tokens → tailwind.config). */

export const labelClass =
  "mb-1 block text-sm font-medium text-foreground-muted";

export const inputClass =
  "w-full rounded-control border border-input bg-muted/50 px-4 py-3 text-foreground placeholder:text-placeholder outline-none transition focus:border-primary focus:bg-surface focus:ring-2 focus:ring-focusRing/20";

export const textareaClass =
  "w-full resize-none rounded-control border border-input bg-muted/50 px-4 py-3 text-foreground placeholder:text-placeholder outline-none transition focus:border-primary focus:bg-surface focus:ring-2 focus:ring-focusRing/20";

export const fileInputClass =
  "block w-full text-sm text-muted-strong file:mr-3 file:rounded-lg file:border-0 file:bg-primary-muted file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground file:outline-none focus:file:ring-2 focus:file:ring-focusRing/30";

export const selectClass =
  "w-full rounded-control border border-input bg-muted/50 px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:bg-surface focus:ring-2 focus:ring-focusRing/20";

export const sectionLabelClass =
  "mb-1 block text-sm font-medium text-foreground-muted";

/**
 * Dấu * trên nhãn trường bắt buộc.
 * Dùng chung mọi form (trang chủ, đăng nhập, thanh toán nếu có field bắt buộc, v.v.).
 */
export const formRequiredMarkClass = "text-red-600";

/** Chữ gợi ý phụ (không margin — ghép với mt-* tại chỗ) */
export const formFieldHintTextClass = "text-xs text-placeholder";

/** Gợi ý dưới ô nhập */
export const formFieldHintClass = `mt-1 ${formFieldHintTextClass}`;

export const formFieldHintSpacedClass = `mt-1.5 ${formFieldHintTextClass}`;

/** Tiêu đề nhóm con trong form (vd. Ruột / Bìa) */
export const formSubsectionTitleClass =
  "mb-2 text-sm font-semibold text-foreground";

/** Khối nhóm field có viền nền nhẹ (trong card) */
export const formNestedPanelClass =
  "space-y-4 rounded-control border border-border/80 bg-muted/30 p-4";

/** Lưới segment: 2 / 3 / 4 cột (dùng với `SegmentedControl`) */
export const segmentedControlGridClass = "grid grid-cols-2 gap-2";

export const segmentedControlGrid3Class = "grid grid-cols-3 gap-2";

export const segmentedControlGrid4Class = "grid grid-cols-4 gap-2";

/** Ô hiển thị chỉ đọc (vd. tỉnh cố định) — cùng nhịp với input */
export const formReadOnlyBoxClass =
  "rounded-xl border border-border bg-muted/80 px-4 py-3 text-sm text-foreground";

export function choiceButtonClass(selected: boolean): string {
  return `rounded-control border px-4 py-3 text-sm font-medium transition disabled:opacity-50 ${
    selected
      ? "border-primary bg-primary-muted text-primary-foreground"
      : "border-border bg-surface text-foreground-muted hover:bg-muted"
  }`;
}

/** Trang chủ: nền gradient (không flex center như auth). */
export const formPageShellClass =
  "min-h-screen bg-gradient-to-b from-muted to-muted-elevated pb-safe";

/** Khối form trắng trên trang chủ. */
export const formSectionCardClass =
  "rounded-card border border-border/80 bg-surface p-5 shadow-sm shadow-card sm:p-6";

export const formPageTitleClass =
  "text-2xl font-bold tracking-tight text-foreground sm:text-3xl";

export const formPageSubtitleClass = "mt-1 text-sm text-muted-foreground";

export const formSectionHeadingClass = "mb-5 text-lg font-semibold text-foreground";

/** Tiêu đề section kiểu overline (vd. khối Hóa đơn trang thanh toán). */
export const formSectionOverlineClass =
  "mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground";

/** Nội dung trang có max-width — payment (hẹp) vs home (rộng). */
export const formPageContentMaxMdClass = "mx-auto w-full max-w-md px-4 py-8";

export const formPageContentMaxLgClass =
  "mx-auto w-full max-w-lg px-4 py-8 sm:py-12";

export const formPageFooterNoteClass =
  "mt-6 text-center text-xs text-placeholder";

/** Shell trang auth (gradient nền). */
export const authShellClass =
  "flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-muted to-muted-elevated px-4";

/** Panel card (đăng nhập, khối form có bóng nhẹ). */
export const formCardClass =
  "rounded-card border border-border/80 bg-surface p-6 shadow-sm shadow-card";

export const authTitleClass = "text-xl font-bold text-foreground";

export const authSubtitleClass = "mt-1 text-sm text-muted-foreground";

/** Nút CTA chính (đăng nhập, gửi đơn). */
export const formPrimaryButtonClass =
  "w-full rounded-control bg-primary py-3.5 font-medium text-white shadow-sm transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-focusRing focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-60";

/** Nút primary không full width (vd. link CTA trang thanh toán). */
export const formPrimaryButtonInlineClass =
  "inline-block rounded-control bg-primary px-6 py-3 font-medium text-white shadow-sm transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-focusRing focus:ring-offset-2";

/** Nút phụ / outline (đăng xuất, tải QR dạng nút, v.v.). */
export const formSecondaryButtonClass =
  "rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground-muted shadow-sm transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-focusRing focus:ring-offset-2";

/** Nút secondary full-width (vd. link tải QR trên trang thanh toán). */
export const formSecondaryButtonBlockClass = `${formSecondaryButtonClass} mt-5 block w-full rounded-control py-3 text-center`;

export const formSuccessAlertClass =
  "rounded-control bg-primary-muted px-4 py-3 text-sm text-primary-foreground";

export const formErrorAlertClass =
  "rounded-control bg-danger px-4 py-3 text-sm text-danger-foreground";

export const formNeutralAlertClass =
  "rounded-control bg-muted px-4 py-3 text-sm text-foreground-muted";

export const formAlertSpinnerClass =
  "mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary/40 border-t-transparent";

/** Spinner toàn trang (admin loading). */
export const adminPageSpinnerClass =
  "inline-block h-8 w-8 animate-spin rounded-full border-2 border-focusRing border-t-transparent";

export const authFooterNoteClass = "mt-4 text-center text-xs text-placeholder";

/* --- Admin shell (cùng token) --- */

export const adminShellClass = "min-h-screen bg-muted";

export const adminHeaderClass =
  "sticky top-0 z-10 border-b border-border bg-surface px-4 py-3 shadow-sm";

export const adminTitleClass = "text-lg font-semibold text-foreground";

/** Alias — dùng formSecondaryButtonClass. */
export const adminSecondaryButtonClass = formSecondaryButtonClass;

/** Vùng main dưới header admin (loading / lỗi / danh sách). */
export const adminMainContentClass = "mx-auto w-full px-4 py-8 sm:px-6";

/** Link accent (SĐT, file, footer). */
export const linkAccentClass = "text-primary hover:underline";

/** Hàng bảng desktop (`group` cho ô sticky nền hover). */
export const tableRowClass =
  "group border-b border-border last:border-0 hover:bg-muted/50";

/** Khối bọc bảng có scroll (desktop). */
export const adminTableContainerClass =
  "hidden max-h-[min(70vh,calc(100vh-10rem))] overflow-auto rounded-2xl border border-border bg-surface shadow-sm md:block";

/** Card một đơn (mobile). */
export const adminMobileCardClass =
  "rounded-2xl border border-border bg-surface p-4 shadow-sm";

/** Trạng thái không có đơn. */
export const adminEmptyStateCardClass =
  "rounded-2xl border border-border bg-surface p-12 text-center text-muted-foreground";

/** Ô thead bảng admin (sticky). */
export const adminTableTheadCellClass =
  "sticky top-0 z-10 border-b border-border bg-muted/95 font-semibold text-foreground-muted shadow-sm backdrop-blur-sm";

/** Thead: ô góc trên–trái (sticky top + left) — cột Khách. */
export const adminTableTheadStickyLeftClass =
  "sticky top-0 left-0 z-[25] border-b border-border bg-muted/95 font-semibold text-foreground-muted shadow-[4px_0_12px_-4px_rgba(0,0,0,0.12)] backdrop-blur-sm";

/** Thead: ô góc trên–phải (sticky top + right) — cột Thao tác. */
export const adminTableTheadStickyRightClass =
  "sticky top-0 right-0 z-[25] border-b border-border bg-muted/95 font-semibold text-foreground-muted shadow-[-4px_0_12px_-4px_rgba(0,0,0,0.12)] backdrop-blur-sm";

/** Body: cột Khách — sticky trái, nền theo hover hàng (group trên &lt;tr&gt;). */
export const adminTableBodyStickyLeftClass =
  "sticky left-0 z-[15] bg-surface shadow-[4px_0_12px_-4px_rgba(0,0,0,0.1)] group-hover:bg-muted/50";

/** Body: cột Thao tác — sticky phải. */
export const adminTableBodyStickyRightClass =
  "sticky right-0 z-[15] bg-surface shadow-[-4px_0_12px_-4px_rgba(0,0,0,0.1)] group-hover:bg-muted/50";

/** Skeleton thanh toán / loading. */
export const paymentSkeletonStrongClass = "animate-pulse rounded-full bg-border";
export const paymentSkeletonMutedClass = "animate-pulse rounded-full bg-muted-elevated";

/** Card section có margin dưới (trang thanh toán). */
export const formSectionCardMbClass = `${formSectionCardClass} mb-6`;
