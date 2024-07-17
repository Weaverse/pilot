import type { LoaderFunctionArgs } from "@shopify/remix-oxygen";
import { json } from "@shopify/remix-oxygen";

export async function loader({ params, context }: LoaderFunctionArgs) {
  const { cart } = context;

  try {
    let variantId = params.variantId;

    let inputLines = [
      {
        merchandiseId: `gid://shopify/ProductVariant/${variantId}`,
        quantity: 1,
      },
    ];
    let result = await cart.addLines(inputLines);

    /**
     * The Cart ID may change after each mutation. We need to update it each time in the session.
     */
    const cartId = result.cart.id;
    const headers = cart.setCartId(cartId);
    headers.set("Location", "/cart");

    const { cart: cartResult, errors, userErrors } = result;

    return json(
      {
        cart: cartResult,
        userErrors,
        errors,
      },
      { status: 303, headers },
    );
  } catch (e) {
    console.error(e);
    return json({ error: e });
  }
}
