/**
 * Local port of classic Hydrogen's `getPaginationVariables` (`@shopify/hydrogen@2026.4`, MIT).
 * Hydrogen 2026.10 no longer exports it. Behavior is unchanged: reads `cursor`/`direction`
 * (or `${namespace}_cursor`/`${namespace}_direction`) from the request URL.
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
  const cursorParam = namespace ? `${namespace}_cursor` : "cursor";
  const directionParam = namespace ? `${namespace}_direction` : "direction";
  const cursor = searchParams.get(cursorParam) ?? undefined;
  const isPrevious = searchParams.get(directionParam) === "previous";

  if (isPrevious) {
    return { last: pageBy, startCursor: cursor ?? null };
  }
  return { first: pageBy, endCursor: cursor ?? null };
}
