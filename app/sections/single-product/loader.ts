import type { WeaverseComponentLoaderArgs } from "@weaverse/hydrogen/react-router";
import { PRODUCT_QUERY, PRODUCT_VARIANTS_QUERY } from "~/graphql/queries";
import { CACHE_DEFAULT } from "~/utils/cache";
import { unwrapStorefront } from "~/utils/storefront";
import type { SingleProductData } from "./index";

export type SingleProductLoaderData = Awaited<ReturnType<typeof loader>>;

export let loader = async ({
  data,
  weaverse,
}: WeaverseComponentLoaderArgs<SingleProductData>) => {
  let { storefront } = weaverse;
  let handle = data?.product?.handle;

  if (!handle) {
    return null;
  }

  let [result, variantsResult] = await Promise.all([
    storefront
      .graphql(PRODUCT_QUERY, {
        // `$country`/`$language` come from the storefront client's closure,
        // which holds the Shopify provider enum. Never pass the market's
        // public code here: bare `ZH` resolves to English.
        variables: { handle, selectedOptions: [] },
        cache: CACHE_DEFAULT,
      })
      .then(unwrapStorefront)
      .catch(() => null),
    storefront
      .graphql(PRODUCT_VARIANTS_QUERY, {
        variables: { handle },
        cache: CACHE_DEFAULT,
      })
      .then(unwrapStorefront)
      .catch(() => null),
  ]);

  if (!result?.product) {
    return null;
  }

  return {
    product: result.product,
    variants: variantsResult?.product?.variants?.nodes ?? [],
  };
};
