import type { Storefront } from "@shopify/hydrogen";
import type { ProductQuery } from "storefrontapi.generated";
import { PRODUCT_QUERY, VARIANTS_QUERY } from "~/data/queries";

export let getProductData = async (
  storefront: Storefront,
  productHandle: string,
) => {
  let { product, shop } = await storefront.query<ProductQuery>(PRODUCT_QUERY, {
    variables: {
      handle: productHandle,
      selectedOptions: [],
      language: storefront.i18n.language,
      country: storefront.i18n.country,
    },
  });
  let variants = await storefront.query(VARIANTS_QUERY, {
    variables: {
      handle: productHandle,
      language: storefront.i18n.language,
      country: storefront.i18n.country,
    },
  });
  return {
    product,
    variants,
    storeDomain: shop.primaryDomain.url,
    shop,
  };
};

export type ProductData = Awaited<ReturnType<typeof getProductData>>;
