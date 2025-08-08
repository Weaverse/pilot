import {
  Analytics,
  getAdjacentAndFirstAvailableVariants,
  getSeoMeta,
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
import {
  COMBINED_LISTINGS_CONFIGS,
  isCombinedListing,
} from "~/utils/combined-listings";
import { createJudgeMeReview, getJudgeMeProductReviews } from "~/utils/judgeme";
import { getRecommendedProducts } from "~/utils/product";
import {
  redirectIfCombinedListing,
  redirectIfHandleIsLocalized,
} from "~/utils/redirect";
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

  if (COMBINED_LISTINGS_CONFIGS.redirectToFirstVariant) {
    redirectIfCombinedListing(request, product);
  }

  // Use Hydrogen/Remix streaming for recommended products
  const recommended = getRecommendedProducts(storefront, product.id);

  return {
    shop,
    product,
    weaverseData,
    productReviews,
    storeDomain: shop.primaryDomain.url,
    seo: seoPayload.product({ product, url: request.url }),
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
  const combinedListing = isCombinedListing(product);

  // Optimistically selects a variant with given available variant information
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  // Sets the search param to the selected variant without navigation
  // when no search params are set or when variant options don't match
  useEffect(() => {
    if (!selectedVariant?.selectedOptions || combinedListing) {
      return;
    }

    const currentParams = new URLSearchParams(window.location.search);
    let needsUpdate = false;

    // If no search params exist, we need to add them
    if (window.location.search === "") {
      needsUpdate = true;
    } else {
      // Check if any of the selected variant options differ from current params
      for (const option of selectedVariant.selectedOptions) {
        const currentValue = currentParams.get(option.name);
        if (currentValue !== option.value) {
          needsUpdate = true;
          break;
        }
      }
    }

    if (needsUpdate) {
      // Preserve existing non-variant-related params
      const updatedParams = new URLSearchParams(currentParams);

      // Update or add variant option params
      for (const option of selectedVariant.selectedOptions) {
        updatedParams.set(option.name, option.value);
      }

      const newSearch = updatedParams.toString();
      if (newSearch !== window.location.search.slice(1)) {
        window.history.replaceState(
          {},
          "",
          `${location.pathname}?${newSearch}`,
        );
      }
    }
  }, [selectedVariant?.selectedOptions, combinedListing]);

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
