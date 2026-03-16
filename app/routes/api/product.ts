import type { LoaderFunction } from "react-router";
import { data } from "react-router";
import type { ProductQuery } from "storefront-api.generated";
import { PRODUCT_QUERY } from "~/graphql/queries";

export const loader: LoaderFunction = async ({ context, params }) => {
  try {
    const { storefront } = context;
    const { productHandle } = params;

    if (!productHandle) {
      return data({ shop: null, product: null, storeDomain: null });
    }

    const result = await storefront
      .query<ProductQuery>(PRODUCT_QUERY, {
        variables: {
          handle: productHandle,
          selectedOptions: [],
          language: storefront.i18n.language,
          country: storefront.i18n.country,
        },
      })
      .catch(() => null);

    if (!result) {
      return data({ shop: null, product: null, storeDomain: null });
    }

    const { product, shop } = result;
    return data({
      shop,
      product,
      storeDomain: shop?.primaryDomain?.url || null,
    });
  } catch (err) {
    console.error("[Error in product API loader]", err);
    return data({ shop: null, product: null, storeDomain: null });
  }
};
