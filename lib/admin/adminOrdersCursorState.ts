export function parseCursorStack(raw: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 || s === "");
}

export function writeCursor(sp: URLSearchParams, cursor: string | null) {
  if (cursor && cursor.trim()) sp.set("cursor", cursor.trim());
  else sp.delete("cursor");
}

export function writeCursorStack(sp: URLSearchParams, stack: string[]) {
  if (stack.length === 0) sp.delete("cursorStack");
  else sp.set("cursorStack", stack.join(","));
}

export function resetCursorState(sp: URLSearchParams) {
  sp.delete("cursor");
  sp.delete("cursorStack");
}
