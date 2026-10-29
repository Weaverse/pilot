/**
 * Parses a Shopify global ID (`gid://shopify/Product/123?foo=bar#x`) into its
 * parts. Ported from classic hydrogen-react's `parseGid` (same return shape and
 * fallbacks), which Hydrogen 2026.10 no longer exports.
 */
export function parseGid(gid: string | undefined): {
  id: string;
  resource: string | null;
  resourceId: string | null;
  search: string;
  searchParams: URLSearchParams;
  hash: string;
} {
  let defaultReturn = {
    id: "",
    resource: null,
    resourceId: null,
    search: "",
    searchParams: new URLSearchParams(),
    hash: "",
  };
  if (typeof gid !== "string") {
    return defaultReturn;
  }
  try {
    let { search, searchParams, pathname, hash } = new URL(gid);
    let pathnameParts = pathname.split("/");
    let lastPathnamePart = pathnameParts[pathnameParts.length - 1];
    let resourcePart = pathnameParts[pathnameParts.length - 2];
    if (!(lastPathnamePart && resourcePart)) {
      return defaultReturn;
    }
    return {
      id: `${lastPathnamePart}${search}${hash}` || "",
      resource: resourcePart ?? null,
      resourceId: lastPathnamePart || null,
      search,
      searchParams,
      hash,
    };
  } catch {
    return defaultReturn;
  }
}
