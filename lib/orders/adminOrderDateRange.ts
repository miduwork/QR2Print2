/** Múi giờ lọc ngày tạo đơn (đồng bộ dashboard). */
export const ADMIN_ORDER_DATE_TIMEZONE = "Asia/Ho_Chi_Minh";

const YMD_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isValidYmd(s: string): boolean {
  if (!YMD_RE.test(s)) return false;
  const [y, m, d] = s.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === m - 1 &&
    dt.getUTCDate() === d
  );
}

/** Ngày hiện tại theo lịch tại `timeZone` (YYYY-MM-DD). */
export function getTodayYmdInZone(now: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** Cộng trừ theo ngày dương lịch (VN không DST — dùng UTC date parts). */
export function addDaysToYmd(ymd: string, deltaDays: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d));
  t.setUTCDate(t.getUTCDate() + deltaDays);
  const yy = t.getUTCFullYear();
  const mm = String(t.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(t.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

/** Đầu / cuối một ngày tại VN → ISO UTC cho Supabase. */
export function vnDayBoundsUtcIso(ymd: string): { gte: string; lte: string } {
  const start = new Date(`${ymd}T00:00:00+07:00`);
  const end = new Date(`${ymd}T23:59:59.999+07:00`);
  return { gte: start.toISOString(), lte: end.toISOString() };
}

/** Khoảng [fromYmd, toYmd] inclusive, hoán đổi nếu from > to. */
export function vnRangeBoundsUtcIso(
  fromYmd: string,
  toYmd: string,
): { gte: string; lte: string } {
  let a = fromYmd;
  let b = toYmd;
  if (a > b) {
    const t = a;
    a = b;
    b = t;
  }
  const gte = vnDayBoundsUtcIso(a).gte;
  const lte = vnDayBoundsUtcIso(b).lte;
  return { gte, lte };
}

/**
 * Đọc `dateFrom`/`dateTo` (ưu tiên) hoặc `datePreset` (`today` | `7d`) từ query.
 * `7d` = 7 ngày lịch gồm hôm nay (từ 00:00 hôm nay−6 đến cuối hôm nay).
 */
export function parseCreatedAtRangeFromSearchParams(
  searchParams: URLSearchParams,
  now: Date = new Date(),
): { gte: string; lte: string } | null {
  const fromRaw = (searchParams.get("dateFrom") ?? "").trim();
  const toRaw = (searchParams.get("dateTo") ?? "").trim();
  if (fromRaw && toRaw && isValidYmd(fromRaw) && isValidYmd(toRaw)) {
    return vnRangeBoundsUtcIso(fromRaw, toRaw);
  }

  const preset = (searchParams.get("datePreset") ?? "").trim().toLowerCase();
  if (preset === "today") {
    const ymd = getTodayYmdInZone(now, ADMIN_ORDER_DATE_TIMEZONE);
    const { gte, lte } = vnDayBoundsUtcIso(ymd);
    return { gte, lte };
  }
  if (preset === "7d") {
    const todayYmd = getTodayYmdInZone(now, ADMIN_ORDER_DATE_TIMEZONE);
    const startYmd = addDaysToYmd(todayYmd, -6);
    return vnRangeBoundsUtcIso(startYmd, todayYmd);
  }

  return null;
}
