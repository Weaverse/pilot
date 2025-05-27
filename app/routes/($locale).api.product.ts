import type { Storefront } from "@shopify/hydrogen";
import type { LoaderFunction } from "react-router";
import { data } from "react-router";
import type { ProductQuery, VariantsQuery } from "storefront-api.generated";
import { PRODUCT_QUERY, VARIANTS_QUERY } from "~/graphql/queries";

export let loader: LoaderFunction = async ({
  request,
  context: { storefront },
}) => {
  let { searchParams } = new URL(request.url);
  let handle = searchParams.get("handle");
  if (handle) {
    let productData = await getProductData(storefront, handle);
    return data(productData);
  }
  return data(null, { status: 404 });
};

async function getProductData(storefront: Storefront, handle: string) {
  let { product, shop } = await storefront.query<ProductQuery>(PRODUCT_QUERY, {
    variables: {
      handle,
      selectedOptions: [],
      language: storefront.i18n.language,
      country: storefront.i18n.country,
    },
  });
  let variants = await storefront.query<VariantsQuery>(VARIANTS_QUERY, {
    variables: {
      handle,
      language: storefront.i18n.language,
      country: storefront.i18n.country,
    },
  });
  return {
    shop,
    product,
    variants,
    storeDomain: shop.primaryDomain.url,
  };
}

export type ProductData = Awaited<ReturnType<typeof getProductData>>;
