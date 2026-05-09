/**
 * Resolve a stored image path to a URL the browser can fetch.
 *
 * `imagePath` shapes we accept:
 *   - "/objects/uploads/abc"    → served via /api/storage/objects/uploads/abc
 *   - "/objects/...something..." → served via /api/storage<imagePath>
 *   - "https://..." (absolute)   → returned as-is
 *   - null/empty                 → null (caller renders placeholder)
 */
export function resolveImageUrl(
  imagePath: string | null | undefined,
  opts: { cacheBust?: string | number | null } = {},
): string | null {
  if (!imagePath) return null;
  let url: string;
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    url = imagePath;
  } else if (imagePath.startsWith("/objects/")) {
    url = `/api/storage${imagePath}`;
  } else if (imagePath.startsWith("/api/")) {
    url = imagePath;
  } else {
    url = `/api/storage/public-objects/${imagePath.replace(/^\//, "")}`;
  }
  if (opts.cacheBust != null && opts.cacheBust !== "") {
    const sep = url.includes("?") ? "&" : "?";
    url = `${url}${sep}v=${encodeURIComponent(String(opts.cacheBust))}`;
  }
  return url;
}
