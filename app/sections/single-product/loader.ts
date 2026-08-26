import type { ComponentLoaderArgs } from "@weaverse/hydrogen";
import type {
  ProductQuery,
  ProductVariantsQuery,
} from "storefront-api.generated";
import { PRODUCT_QUERY, PRODUCT_VARIANTS_QUERY } from "~/graphql/queries";
import type { SingleProductData } from "./index";

export type SingleProductLoaderData = Awaited<ReturnType<typeof loader>>;

export let loader = async ({
  data,
  weaverse,
}: ComponentLoaderArgs<SingleProductData>) => {
  let { storefront } = weaverse;
  let handle = data?.product?.handle;

  if (!handle) {
    return null;
  }

  let [result, variantsResult] = await Promise.all([
    storefront
      .query<ProductQuery>(PRODUCT_QUERY, {
        // `$country`/`$language` come from the storefront client's closure,
        // which holds the Shopify provider enum. `weaverse.storefront.i18n` is
        // deliberately the market's public identity for the Translation
        // Manager, and bare `ZH` resolves to English.
        variables: { handle, selectedOptions: [] },
      })
      .catch(() => null),
    storefront
      .query<ProductVariantsQuery>(PRODUCT_VARIANTS_QUERY, {
        variables: { handle },
      })
      .catch(() => null),
  ]);

  if (!result?.product) {
    return null;
  }

  let { product, shop } = result;
  return {
    product,
    variants: variantsResult?.product?.variants?.nodes ?? [],
    storeDomain: shop?.primaryDomain?.url || null,
  };
};
