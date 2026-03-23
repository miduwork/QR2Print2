export async function readApiErrorMessage(res: Response): Promise<string> {
  try {
    const j = (await res.json()) as { error?: unknown };
    if (typeof j.error === "string" && j.error) return j.error;
  } catch {
    /* ignore */
  }
  return res.statusText || "Đã xảy ra lỗi.";
}

export function isDocumentVisible(): boolean {
  if (typeof document === "undefined") return true;
  return document.visibilityState === "visible";
}

export type AdminFetchJsonResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string; status: number };

/** Fetch JSON mỏng cho admin client pages/hooks. */
export async function adminFetchJson<T>(
  url: string,
  init?: RequestInit,
): Promise<AdminFetchJsonResult<T>> {
  const res = await fetch(url, {
    credentials: "same-origin",
    cache: "no-store",
    ...init,
  });
  if (!res.ok) {
    return {
      ok: false,
      message: await readApiErrorMessage(res),
      status: res.status,
    };
  }
  const data = (await res.json()) as T;
  return { ok: true, data };
}
