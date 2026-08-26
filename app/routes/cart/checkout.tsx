import type { CartBuyerIdentityInput } from "@shopify/hydrogen/storefront-api-types";
import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { appendForwardedAttribution } from "~/utils/checkout-attribution";
import { localizePath, resolveLocale } from "~/utils/locale";

export async function loader({ context, request }: LoaderFunctionArgs) {
  const { cart, storefront } = context;
  const requestUrl = new URL(request.url);
  const result = await cart.updateBuyerIdentity({
    countryCode: storefront.i18n.country,
  } as CartBuyerIdentityInput);

  const checkoutUrl =
    result?.cart?.checkoutUrl ?? (await cart.get())?.checkoutUrl;

  if (!checkoutUrl) {
    // Keep the buyer on their active locale's cart instead of dropping them
    // onto the default-locale cart.
    return redirect(localizePath("/cart", resolveLocale(requestUrl.pathname)));
  }

  const headers = result?.cart?.id ? cart.setCartId(result.cart.id) : undefined;
  const attributedCheckoutUrl = appendForwardedAttribution(
    checkoutUrl,
    requestUrl.search,
  );

  return redirect(attributedCheckoutUrl, { headers });
}
