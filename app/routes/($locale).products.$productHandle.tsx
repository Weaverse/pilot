import {
  Analytics,
  getAdjacentAndFirstAvailableVariants,
  getProductOptions,
  getSeoMeta,
  mapSelectedProductOptionToObject,
  useOptimisticVariant,
} from "@shopify/hydrogen";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaArgs,
} from "@shopify/remix-oxygen";
import { data } from "@shopify/remix-oxygen";
import { getSelectedProductOptions } from "@weaverse/hydrogen";
import { useEffect } from "react";
import { useLoaderData } from "react-router";
import type { ProductQuery } from "storefront-api.generated";
import invariant from "tiny-invariant";
import { PRODUCT_QUERY } from "~/graphql/queries";
import { routeHeaders } from "~/utils/cache";
import { createJudgeMeReview, getJudgeMeProductReviews } from "~/utils/judgeme";
import { getRecommendedProducts } from "~/utils/product";
import { redirectIfHandleIsLocalized } from "~/utils/redirect";
import { seoPayload } from "~/utils/seo.server";
import { WeaverseContent } from "~/weaverse";

export const headers = routeHeaders;

export async function loader({ params, request, context }: LoaderFunctionArgs) {
  const { productHandle: handle } = params;

  invariant(handle, "Missing productHandle param, check route filename");

  const { storefront, weaverse } = context;
  const selectedOptions = getSelectedProductOptions(request);
  const [{ shop, product }, weaverseData, productReviews] = await Promise.all([
    storefront.query<ProductQuery>(PRODUCT_QUERY, {
      variables: {
        handle,
        selectedOptions,
        country: storefront.i18n.country,
        language: storefront.i18n.language,
      },
    }),
    weaverse.loadPage({ type: "PRODUCT", handle }),
    getJudgeMeProductReviews({ context, handle }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!product?.id) {
    throw new Response("product", { status: 404 });
  }
  redirectIfHandleIsLocalized(request, { handle, data: product });

  // Use Hydrogen/Remix streaming for recommended products
  const recommended = getRecommendedProducts(storefront, product.id);

  return {
    shop,
    product,
    weaverseData,
    productReviews,
    storeDomain: shop.primaryDomain.url,
    seo: seoPayload.product({
      product,
      url: request.url,
    }),
    recommended,
    selectedOptions,
  };
}

export async function action({
  request,
  context: { env },
}: ActionFunctionArgs) {
  try {
    invariant(
      env.JUDGEME_PRIVATE_API_TOKEN,
      "Missing `JUDGEME_PRIVATE_API_TOKEN`",
    );

    const response = await createJudgeMeReview({
      formData: await request.formData(),
      apiToken: env.JUDGEME_PRIVATE_API_TOKEN,
      shopDomain: env.PUBLIC_STORE_DOMAIN,
    });
    return response;
  } catch (error) {
    console.error(error);
    return data({ error: "Failed to create review!" }, { status: 500 });
  }
}

export const meta = ({ matches }: MetaArgs<typeof loader>) => {
  return getSeoMeta(
    ...matches.map((match) => (match.data as any)?.seo).filter(Boolean),
  );
};

export default function Product() {
  const { product } = useLoaderData<typeof loader>();

  // Optimistically selects a variant with given available variant information
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  // Sets the search param to the selected variant without navigation
  // only when no search params are set in the url
  useEffect(() => {
    const searchParams = new URLSearchParams(
      mapSelectedProductOptionToObject(selectedVariant?.selectedOptions || []),
    );

    if (window.location.search === "" && searchParams.toString() !== "") {
      window.history.replaceState(
        {},
        "",
        `${location.pathname}?${searchParams.toString()}`,
      );
    }
  }, [selectedVariant?.selectedOptions]);

  // Get the product options array
  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  return (
    <>
      <WeaverseContent />
      {selectedVariant && (
        <Analytics.ProductView
          data={{
            products: [
              {
                id: product.id,
                title: product.title,
                price: selectedVariant?.price.amount || "0",
                vendor: product.vendor,
                variantId: selectedVariant?.id || "",
                variantTitle: selectedVariant?.title || "",
                quantity: 1,
              },
            ],
          }}
        />
      )}
    </>
  );
}
