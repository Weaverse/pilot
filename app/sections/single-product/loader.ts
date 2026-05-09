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
  let { language, country } = storefront.i18n;
  let handle = data?.product?.handle;

  if (!handle) {
    return null;
  }

  let [result, variantsResult] = await Promise.all([
    storefront
      .query<ProductQuery>(PRODUCT_QUERY, {
        variables: { handle, selectedOptions: [], country, language },
      })
      .catch(() => null),
    storefront
      .query<ProductVariantsQuery>(PRODUCT_VARIANTS_QUERY, {
        variables: { handle, country, language },
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
