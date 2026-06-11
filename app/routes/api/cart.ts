import type { LoaderFunctionArgs } from "react-router";
import { data } from "react-router";

/**
 * Client-side cart/session bootstrap.
 *
 * The cart and the customer access token used to live in the root loader's
 * deferred data, which streams into the rendered HTML document. That made
 * every document response personalized, blocking Oxygen's full-page cache
 * (and risking one visitor's cart leaking into another's cached page).
 * `CartStoreSync` now fetches this endpoint after hydration instead.
 *
 * `no-store`: this response IS personalized — it must never enter any
 * shared cache.
 */
export async function loader({ context }: LoaderFunctionArgs) {
  const { cart, customerAccount } = context;
  const [cartData, customerAccessToken] = await Promise.all([
    cart.get(),
    customerAccount.getAccessToken().catch(() => null),
  ]);

  return data(
    { cart: cartData, customerAccessToken: customerAccessToken ?? null },
    { headers: { "Cache-Control": "no-store" } },
  );
}
