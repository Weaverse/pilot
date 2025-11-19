import type { ActionFunction, LoaderFunction } from "react-router";
import { data } from "react-router";
import type { ProductQuery } from "storefront-api.generated";
import { PRODUCT_QUERY } from "~/graphql/queries";
import type {
  JudgeMeReviewType,
  JudgemeProduct,
  JudgemeWidgetData,
} from "~/types/judgeme";
import { parseBadgeHtml, parseJudgemeWidgetHTML } from "~/utils/judgeme";
import { constructURL, formDataToObject } from "~/utils/misc";

const JUDGEME_PRODUCT_API = "https://judge.me/api/v1/products/-1";
const JUDGEME_BADGE_API = "https://api.judge.me/api/v1/widgets/preview_badge";
const JUDGEME_WIDGET_API = "https://api.judge.me/api/v1/widgets/product_review";
const JUDGEME_REVIEWS_API = "https://api.judge.me/api/v1/reviews";

export const loader: LoaderFunction = async ({ request, context, params }) => {
  try {
    const { storefront, weaverse, env } = context;
    const url = new URL(request.url);
    const { searchParams, pathname } = url;
    const { productHandle } = params;

    if (!productHandle) {
      return data({ shop: null, product: null, storeDomain: null });
    }

    // Handle reviews endpoint
    if (pathname.endsWith("/reviews")) {
      const { fetchWithCache } = weaverse;
      const { JUDGEME_PRIVATE_API_TOKEN, PUBLIC_STORE_DOMAIN } = env;

      if (!JUDGEME_PRIVATE_API_TOKEN) {
        return {
          reviews: [],
          totalPage: 0,
          currentPage: 1,
          perPage: 5,
        };
      }
      if (!PUBLIC_STORE_DOMAIN) {
        return {
          reviews: [],
          totalPage: 0,
          currentPage: 1,
          perPage: 5,
        };
      }

      const type = searchParams.get("type");
      // Fetching product rating stars
      if (type === "rating") {
        const badgeResponse = await fetchWithCache<{
          product_external_id: number;
          badge: string;
        }>(
          constructURL(JUDGEME_BADGE_API, {
            api_token: JUDGEME_PRIVATE_API_TOKEN,
            shop_domain: PUBLIC_STORE_DOMAIN,
            handle: productHandle,
          }),
        );

        if (!badgeResponse?.badge) {
          return null;
        }
        return parseBadgeHtml(badgeResponse.badge);
      }

      const judgemeProductRes = await fetchWithCache<{
        product: JudgemeProduct;
      }>(
        constructURL(JUDGEME_PRODUCT_API, {
          handle: productHandle,
          shop_domain: PUBLIC_STORE_DOMAIN,
          api_token: JUDGEME_PRIVATE_API_TOKEN,
        }),
      );
      if (!judgemeProductRes?.product?.id) {
        return {
          reviews: [],
          totalPage: 0,
          currentPage: 1,
          perPage: 5,
        };
      }

      const page = Number.parseInt(searchParams.get("page") || "1", 10);
      const per_page = Number.parseInt(searchParams.get("per_page") || "5", 10);

      let reviewSummary: JudgemeWidgetData = null;
      let totalPage = -1;
      const widgetResponse = await fetchWithCache<{
        product_external_id: number;
        widget: string;
      }>(
        constructURL(JUDGEME_WIDGET_API, {
          api_token: JUDGEME_PRIVATE_API_TOKEN,
          shop_domain: PUBLIC_STORE_DOMAIN,
          handle: productHandle,
          per_page,
          page,
        }),
      );

      if (widgetResponse?.widget) {
        reviewSummary = parseJudgemeWidgetHTML(widgetResponse.widget);
        totalPage = Math.ceil(
          reviewSummary.totalReviews / (per_page > 0 ? per_page : 5),
        );
      }

      const reviewsData = await fetchWithCache<{
        reviews: JudgeMeReviewType[];
        current_page: number;
        per_page: number;
      }>(
        constructURL(JUDGEME_REVIEWS_API, {
          api_token: JUDGEME_PRIVATE_API_TOKEN,
          shop_domain: PUBLIC_STORE_DOMAIN,
          product_id: judgemeProductRes.product.id,
          per_page,
          page,
        }),
      );
      return {
        reviews: reviewsData?.reviews || [],
        totalPage,
        currentPage: reviewsData?.current_page || 1,
        perPage: reviewsData?.per_page || per_page || 5,
        ...reviewSummary,
      };
    }

    // Handle product endpoint (default)
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

export const action: ActionFunction = async ({ request, context, params }) => {
  try {
    const { env } = context;
    const { productHandle } = params;

    if (!productHandle) {
      return data({ review: null });
    }

    const { JUDGEME_PRIVATE_API_TOKEN, PUBLIC_STORE_DOMAIN } = env;

    if (!JUDGEME_PRIVATE_API_TOKEN) {
      return data({ review: null });
    }
    if (!PUBLIC_STORE_DOMAIN) {
      return data({ review: null });
    }

    const formData = await request.formData();
    const response = await fetch(
      constructURL(JUDGEME_REVIEWS_API, {
        api_token: JUDGEME_PRIVATE_API_TOKEN,
        shop_domain: PUBLIC_STORE_DOMAIN,
      }),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shop_domain: PUBLIC_STORE_DOMAIN,
          platform: "shopify",
          ...formDataToObject(formData),
        }),
      },
    );
    const payload = await response.json<JudgeMeReviewType>();
    return data({ review: payload }, { status: 201 });
  } catch (err) {
    console.error("[Error in product API action]", err);
    return data({ review: null });
  }
};
