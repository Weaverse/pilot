import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { localizedPathForRequest } from "~/utils/locale";
import { safeRedirectPath } from "~/utils/safe-redirect";

/**
 * Automatically applies a discount found on the url
 * If a cart exists it's updated with the discount, otherwise a cart is created with the discount already applied
 * @param ?redirect an optional path to return to otherwise return to the home page
 * @example
 * Example path applying a discount and redirecting
 * ```ts
 * /discount/FREESHIPPING?redirect=/products
 *
 * ```
 * @preserve
 */
export async function loader({ request, context, params }: LoaderFunctionArgs) {
  const { cart } = context;
  // N.B. This route will probably be removed in the future.
  const { code } = params;

  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);
  const redirectParam =
    searchParams.get("redirect") || searchParams.get("return_to");

  // Both parameters are public and unauthenticated. `URLSearchParams` decodes
  // `%2F%5C` to `/\`, which reads as a local path but which browsers resolve
  // as an authority, so the target is guarded by the same rule as the cart
  // form rather than a second, weaker one. A refused target keeps the
  // shopper's market: falling back to `/` would also drop them off `/de-de`.
  const target = safeRedirectPath(
    redirectParam,
    localizedPathForRequest(request, "/"),
  );

  searchParams.delete("redirect");
  searchParams.delete("return_to");

  // The remaining parameters ride along to the target. The split is by hand
  // because re-serialising through `new URL()` resolves `..` segments, which
  // turns an accepted `/..//evil.example` back into a network-path reference.
  const hashAt = target.indexOf("#");
  const path = hashAt === -1 ? target : target.slice(0, hashAt);
  const hash = hashAt === -1 ? "" : target.slice(hashAt);
  const query = searchParams.toString();
  const separator = query ? (path.includes("?") ? "&" : "?") : "";
  const redirectUrl = `${path}${separator}${query}${hash}`;

  if (!code) {
    return redirect(redirectUrl);
  }

  const result = await cart.updateDiscountCodes([code]);
  const headers = cart.setCartId(result.cart.id);

  // Using set-cookie on a 303 redirect will not work if the domain origin have port number (:3000)
  // If there is no cart id and a new cart id is created in the progress, it will not be set in the cookie
  // on localhost:3000
  return redirect(redirectUrl, {
    status: 303,
    headers,
  });
}
