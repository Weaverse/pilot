/**
 * Local port of classic Hydrogen's `getPaginationVariables` (`@shopify/hydrogen@2026.4`, MIT).
 * Hydrogen 2026.10 no longer exports it. Reads the `after`/`before` cursor params
 * (or `${namespace}_after`/`${namespace}_before`) from the request URL: the cursor names
 * Hydrogen 2026.10's collection helpers clear when filters or sort change.
 */
export function getPaginationVariables(
  request: Request,
  options: { pageBy: number; namespace?: string } = { pageBy: 20 },
):
  | { last: number; startCursor: string | null }
  | { first: number; endCursor: string | null } {
  if (typeof request?.url === "undefined") {
    throw new Error(
      "getPaginationVariables must be called with the Request object passed to your loader function",
    );
  }

  const { pageBy, namespace = "" } = options;
  const searchParams = new URLSearchParams(new URL(request.url).search);
  const prefix = namespace ? `${namespace}_` : "";
  const before = searchParams.get(`${prefix}before`);

  if (before) {
    return { last: pageBy, startCursor: before };
  }
  return { first: pageBy, endCursor: searchParams.get(`${prefix}after`) };
}
