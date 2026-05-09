import type { LoaderFunction } from "react-router";
import { data } from "react-router";
import type {
  ProductQuery,
  ProductVariantsQuery,
} from "storefront-api.generated";
import { PRODUCT_QUERY, PRODUCT_VARIANTS_QUERY } from "~/graphql/queries";

export const loader: LoaderFunction = async ({ context, params }) => {
  try {
    const { storefront } = context;
    const { productHandle } = params;

    if (!productHandle) {
      return data({
        shop: null,
        product: null,
        variants: [],
        storeDomain: null,
      });
    }

    const variables = {
      handle: productHandle,
      language: storefront.i18n.language,
      country: storefront.i18n.country,
    };

    const [result, variantsResult] = await Promise.all([
      storefront
        .query<ProductQuery>(PRODUCT_QUERY, {
          variables: { ...variables, selectedOptions: [] },
        })
        .catch(() => null),
      storefront
        .query<ProductVariantsQuery>(PRODUCT_VARIANTS_QUERY, { variables })
        .catch(() => null),
    ]);

    if (!result) {
      return data({
        shop: null,
        product: null,
        variants: [],
        storeDomain: null,
      });
    }

    const { product, shop } = result;
    return data({
      shop,
      product,
      variants: variantsResult?.product?.variants?.nodes ?? [],
      storeDomain: shop?.primaryDomain?.url || null,
    });
  } catch (err) {
    console.error("[Error in product API loader]", err);
    return data({
      shop: null,
      product: null,
      variants: [],
      storeDomain: null,
    });
  }
};
