import type { AppLoadContext } from "react-router";
import type { JudgemeStarsRatingApiResponse, JudgemeStarsRatingData } from "~/types/judgeme";
import { constructURL } from "./misc";

type JudgemeProductData = {
  product: {
    id: string;
    handle: string;
  };
};

type JudgeMeReviewType = {
  id: string;
  title: string;
  created_at: string;
  body: string;
  rating: number;
  reviewer: {
    id: number;
    email: string;
    name: string;
    phone: string;
  };
  pictures: {
    urls: {
      original: string;
      small: string;
      compact: string;
      huge: string;
    };
  }[];
};

export type JudgemeReviewsData = {
  rating: number;
  reviewNumber: number;
  reviews: JudgeMeReviewType[];
};

type JudgemeBadgeInternalApiResponse = {
  product_external_id: number;
  badge: string;
};

const JUDGEME_PRODUCT_API = "https://judge.me/api/v1/products/-1";
const JUDGEME_REVIEWS_API = "https://judge.me/api/v1/reviews";
const JUDGEME_BADGE_API = "https://api.judge.me/api/v1/widgets/preview_badge";

export async function getJudgeMeProductReviews({
  context,
  productHandle,
}: {
  context: AppLoadContext;
  productHandle: string;
}) {
  try {
    const { weaverse, env } = context;
    const { JUDGEME_PRIVATE_API_TOKEN, PUBLIC_STORE_DOMAIN } = env;
    if (!JUDGEME_PRIVATE_API_TOKEN || !PUBLIC_STORE_DOMAIN) {
      throw new Error("JUDGEME_PRIVATE_API_TOKEN or PUBLIC_STORE_DOMAIN is not configured.");
    }
    const { fetchWithCache } = weaverse;
    const { product } = await fetchWithCache<JudgemeProductData>(
      constructURL(JUDGEME_PRODUCT_API, {
        handle: productHandle,
        shop_domain: PUBLIC_STORE_DOMAIN,
        api_token: JUDGEME_PRIVATE_API_TOKEN,
      }),
    );
    if (!product?.id) {
      throw new Error("Product not found in Judge.me database.");
    }
    const { reviews } = await fetchWithCache<JudgemeReviewsData>(
      constructURL(JUDGEME_REVIEWS_API, {
        api_token: JUDGEME_PRIVATE_API_TOKEN,
        shop_domain: PUBLIC_STORE_DOMAIN,
        product_id: product?.id,
      }),
    );
    const reviewNumber = reviews.length || 0;
    const rating = reviews.reduce((a, c) => a + c.rating, 0) / reviewNumber;
    return { rating, reviewNumber, reviews };
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: <explanation> --- IGNORE ---
    console.log("Error fetching Judgeme product reviews", error.message);
    return { rating: 0, reviewNumber: 0, reviews: [] };
  }
}

function parseBadgeHtml(badgeHtml: string): JudgemeStarsRatingData {
  const averageRatingMatch = badgeHtml.match(/data-average-rating=['"]([^'"]+)['"]/);
  const numberOfReviewsMatch = badgeHtml.match(/data-number-of-reviews=['"]([^'"]+)['"]/);

  const averageRating = averageRatingMatch ? Number.parseFloat(averageRatingMatch[1]) : 0;
  const totalReviews = numberOfReviewsMatch ? Number.parseInt(numberOfReviewsMatch[1], 10) : 0;

  return {
    totalReviews,
    averageRating,
    badge: badgeHtml,
  };
}

export async function getJudgeMeBadgeData({
  context,
  productHandle,
}: {
  context: AppLoadContext;
  productHandle: string;
}): Promise<JudgemeStarsRatingApiResponse> {
  try {
    const { weaverse, env } = context;
    const { JUDGEME_PRIVATE_API_TOKEN, PUBLIC_STORE_DOMAIN } = env;

    if (!JUDGEME_PRIVATE_API_TOKEN || !PUBLIC_STORE_DOMAIN) {
      return {
        ok: false,
        error: "JUDGEME_PRIVATE_API_TOKEN or PUBLIC_STORE_DOMAIN is not configured",
      };
    }

    const { fetchWithCache } = weaverse;
    const badgeResponse = await fetchWithCache<JudgemeBadgeInternalApiResponse>(
      constructURL(JUDGEME_BADGE_API, {
        api_token: JUDGEME_PRIVATE_API_TOKEN,
        shop_domain: PUBLIC_STORE_DOMAIN,
        handle: productHandle,
      }),
    );

    if (!badgeResponse.badge) {
      return {
        ok: true,
        data: { totalReviews: 0, averageRating: 0, badge: "" },
      };
    }

    const parsedData = parseBadgeHtml(badgeResponse.badge);
    return {
      ok: true,
      data: parsedData,
    };
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: <explanation> --- IGNORE ---
    console.error("Error fetching Judge.me badge data:", error?.message || error);
    return {
      ok: false,
      error: error?.message || "Failed to fetch Judge.me badge data",
    };
  }
}

export async function createJudgeMeReview({
  formData,
  shopDomain,
  apiToken,
}: {
  shopDomain: string;
  apiToken: string;
  formData: FormData;
}) {
  return await fetch(
    constructURL(JUDGEME_REVIEWS_API, {
      api_token: apiToken,
      shop_domain: shopDomain,
    }),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shop_domain: shopDomain,
        platform: "shopify",
        ...formDataToObject(formData),
      }),
    },
  );
}

function formDataToObject(formData: FormData) {
  const data = {};
  for (const [key, value] of formData.entries()) {
    data[key] = value;
  }
  return data;
}
