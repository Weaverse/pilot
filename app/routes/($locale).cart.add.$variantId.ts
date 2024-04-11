import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {json, redirect} from '@shopify/remix-oxygen';

export async function loader({params, context}: LoaderFunctionArgs) {
  const {cart} = context;

  try {
    let variantId = params.variantId;

    let inputLines = [
      {
        merchandiseId: `gid://shopify/ProductVariant/${variantId}`,
        quantity: 1,
      },
    ];
    await cart.addLines(inputLines);

    return redirect('/cart');
  } catch (e) {
    console.error(e);
    return json({error: e});
  }
}
