import type { LoaderFunction } from "react-router";
import { data } from "react-router";
import type { ProductQuery } from "storefront-api.generated";
import { PRODUCT_QUERY } from "~/graphql/queries";
import {
  getJudgeMeProductRating,
  getJudgeMeProductReviews,
} from "~/utils/judgeme";

export const loader: LoaderFunction = async ({ request, context, params }) => {
  const { storefront } = context;
  const url = new URL(request.url);
  const { searchParams, pathname } = url;
  const { productHandle } = params;

  if (!productHandle) {
    return data(null, { status: 400 });
  }

  // Handle reviews endpoint
  if (pathname.endsWith("/reviews")) {
    const type = searchParams.get("type");

    if (type === "rating") {
      return await getJudgeMeProductRating({ context, productHandle });
    }

    return await getJudgeMeProductReviews({ context, productHandle });
  }

  // Handle product endpoint (default)
  const { product, shop } = await storefront.query<ProductQuery>(
    PRODUCT_QUERY,
    {
      variables: {
        handle: productHandle,
        selectedOptions: [],
        language: storefront.i18n.language,
        country: storefront.i18n.country,
      },
    },
  );
  return data({ shop, product, storeDomain: shop.primaryDomain.url });
};
