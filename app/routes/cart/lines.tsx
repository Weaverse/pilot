import { cartQueries, createCartCookie } from "@shopify/hydrogen";
import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { appendForwardedAttribution } from "~/utils/checkout-attribution";

/**
 * Automatically creates a new cart based on the URL and redirects straight to checkout.
 * Expected URL structure:
 * ```ts
 * /cart/<variant_id>:<quantity>
 *
 * ```
 * More than one `<variant_id>:<quantity>` separated by a comma, can be supplied in the URL, for
 * carts with more than one product variant.
 *
 * Hydrogen answers unprefixed permalinks itself (it hands them to Shopify's
 * own permalink, query included) before the router runs; this route serves
 * the market-prefixed ones (`/fr-ca/cart/...`), creating the cart in that
 * market.
 *
 * @param `?discount` an optional discount code to apply to the cart
 * @example
 * Example path creating a cart with two product variants, different quantities, and a discount code:
 * ```ts
 * /cart/41007289663544:1,41007289696312:2?discount=HYDROBOARD
 *
 * ```
 * @preserve
 */
export async function loader({ request, context, params }: LoaderFunctionArgs) {
  const { storefront } = context;
  const { lines } = params;
  const linesMap = (lines ?? "").split(",").map((line) => {
    const lineDetails = line.split(":");
    const variantId = lineDetails[0];
    const quantity = Number.parseInt(lineDetails[1], 10);

    return {
      merchandiseId: `gid://shopify/ProductVariant/${variantId}`,
      quantity,
    };
  });

  const url = new URL(request.url);
  const discount = url.searchParams.get("discount");

  //! create a cart
  const result = await storefront.graphql(cartQueries.cartCreate, {
    variables: {
      input: {
        lines: linesMap,
        discountCodes: discount ? [discount] : [],
        buyerIdentity: {
          countryCode: storefront.i18n.country,
          // Classic Hydrogen's `cart.create` attached the signed-in
          // customer, so checkout knows them.
          customerAccessToken: await context.customerAccount
            .getAccessToken()
            .catch(() => undefined),
        },
      },
    },
  });
  const payload = result.data?.cartCreate;
  const cartResult = payload?.cart;

  if (result.errors?.length || !cartResult) {
    throw new Response("Link may be expired. Try checking the URL.", {
      status: 410,
    });
  }

  // Update cart id in cookie
  const headers = new Headers({
    "Set-Cookie": createCartCookie(cartResult.id),
  });

  //! redirect to checkout
  if (cartResult.checkoutUrl) {
    // Forward ad-attribution params (gclid, fbclid, utm_*, …) from the
    // storefront URL to the checkout URL so Shopify's built-in tracking
    // on the checkout subdomain sees the same last-click identifiers.
    // Without this, every paid-ad Buy-now order lands on checkout with
    // organic / direct attribution. No-op when no such params are
    // present on the incoming URL.
    return redirect(
      appendForwardedAttribution(cartResult.checkoutUrl, url.search),
      { headers },
    );
  }
  throw new Error("No checkout URL found");
}

export default function Component() {
  return null;
}
