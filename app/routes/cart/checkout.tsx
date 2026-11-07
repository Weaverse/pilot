import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { cartHandlers, syncCartCountry } from "~/.server/cart";
import { appendForwardedAttribution } from "~/utils/checkout-attribution";
import { localizePath, resolveLocale } from "~/utils/locale";

/**
 * The checkout button's target. Moves the cart into the shopper's market
 * (prices, taxes and the checkout's country follow the buyer identity), then
 * hands off to Shopify's checkout with the storefront's ad attribution.
 */
export async function loader({ context, request }: LoaderFunctionArgs) {
  const { storefront, customerAccount } = context;
  const requestUrl = new URL(request.url);
  const synced = await syncCartCountry(request, storefront, {
    customerAccessToken: await customerAccount
      .getAccessToken()
      .catch(() => undefined),
  });
  const checkoutUrl =
    synced.checkoutUrl ??
    (await cartHandlers.get({ storefrontClient: storefront, request })).data
      .cart?.checkoutUrl;

  if (!checkoutUrl) {
    // Keep the buyer on their active locale's cart instead of dropping them
    // onto the default-locale cart.
    return redirect(localizePath("/cart", resolveLocale(requestUrl.pathname)));
  }

  return redirect(appendForwardedAttribution(checkoutUrl, requestUrl.search));
}
