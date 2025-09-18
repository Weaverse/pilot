import type { LoaderFunction } from "react-router";
import { data } from "react-router";
import type { ProductQuery } from "storefront-api.generated";
import invariant from "tiny-invariant";
import { PRODUCT_QUERY } from "~/graphql/queries";
import type {
  JudgeMeReviewType,
  JudgemeProduct,
  JudgemeWidgetData,
} from "~/types/judgeme";
import { parseBadgeHtml, parseJudgemeWidgetHTML } from "~/utils/judgeme";
import { constructURL } from "~/utils/misc";

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

    invariant(productHandle, "Missing product handle.");

    // Handle reviews endpoint
    if (pathname.endsWith("/reviews")) {
      const { fetchWithCache } = weaverse;
      const { JUDGEME_PRIVATE_API_TOKEN, PUBLIC_STORE_DOMAIN } = env;

      invariant(
        JUDGEME_PRIVATE_API_TOKEN && PUBLIC_STORE_DOMAIN,
        "JUDGEME_PRIVATE_API_TOKEN or PUBLIC_STORE_DOMAIN is not configured.",
      );

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

        invariant(badgeResponse?.badge, "No badge returned from Judge.me");
        return parseBadgeHtml(badgeResponse.badge);
      }

      const { product: judgemeProduct } = await fetchWithCache<{
        product: JudgemeProduct;
      }>(
        constructURL(JUDGEME_PRODUCT_API, {
          handle: productHandle,
          shop_domain: PUBLIC_STORE_DOMAIN,
          api_token: JUDGEME_PRIVATE_API_TOKEN,
        }),
      );
      if (!judgemeProduct?.id) {
        throw new Error("Product not found in Judge.me database.");
      }

      const page = Number.parseInt(searchParams.get("page") || "1", 10);
      const per_page = Number.parseInt(searchParams.get("per_page") || "5", 10);

      let reviewSummary: JudgemeWidgetData = null;
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
      }

      const { current_page, reviews } = await fetchWithCache<{
        reviews: JudgeMeReviewType[];
        current_page: number;
        per_page: number;
      }>(
        constructURL(JUDGEME_REVIEWS_API, {
          api_token: JUDGEME_PRIVATE_API_TOKEN,
          shop_domain: PUBLIC_STORE_DOMAIN,
          product_id: judgemeProduct.id,
          per_page,
          page,
        }),
      );
      return { reviews, current_page, per_page, ...reviewSummary };
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
  } catch (err) {
    console.error("[API Error]", err);
    return data(
      { error: err?.message || err?.toString() || "Unknown API error" },
      { status: 500 },
    );
  }
};
