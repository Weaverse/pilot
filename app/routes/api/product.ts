import type { LoaderFunctionArgs } from "react-router";
import { data } from "react-router";
import { PRODUCT_QUERY, PRODUCT_VARIANTS_QUERY } from "~/graphql/queries";
import { CACHE_DEFAULT } from "~/utils/cache";
import { unwrapStorefront } from "~/utils/storefront";

const EMPTY = { shop: null, product: null, variants: [] };

/** Product data for quick shop, in the market of the (prefixed) request path. */
export async function loader({ context, params }: LoaderFunctionArgs) {
  try {
    const { storefront } = context;
    const { productHandle } = params;

    if (!productHandle) {
      return data(EMPTY);
    }

    const [result, variantsResult] = await Promise.all([
      storefront
        .graphql(PRODUCT_QUERY, {
          variables: { handle: productHandle, selectedOptions: [] },
          cache: CACHE_DEFAULT,
        })
        .then(unwrapStorefront)
        .catch(() => null),
      storefront
        .graphql(PRODUCT_VARIANTS_QUERY, {
          variables: { handle: productHandle },
          cache: CACHE_DEFAULT,
        })
        .then(unwrapStorefront)
        .catch(() => null),
    ]);

    if (!result) {
      return data(EMPTY);
    }

    const { product, shop } = result;
    return data({
      shop,
      product,
      variants: variantsResult?.product?.variants?.nodes ?? [],
    });
  } catch (err) {
    console.error("[Error in product API loader]", err);
    return data(EMPTY);
  }
}
