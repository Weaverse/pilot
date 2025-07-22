import type { AppLoadContext } from "react-router";
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

const JUDGEME_PRODUCT_API = "https://judge.me/api/v1/products/-1";
const JUDGEME_REVIEWS_API = "https://judge.me/api/v1/reviews";

export async function getJudgeMeProductReviews({
  context,
  handle,
}: {
  context: AppLoadContext;
  handle: string;
}) {
  try {
    const { weaverse, env } = context;
    const { JUDGEME_PRIVATE_API_TOKEN, PUBLIC_STORE_DOMAIN } = env;
    if (JUDGEME_PRIVATE_API_TOKEN) {
      const { fetchWithCache } = weaverse;
      const { product } = await fetchWithCache<JudgemeProductData>(
        constructURL(JUDGEME_PRODUCT_API, {
          handle,
          shop_domain: PUBLIC_STORE_DOMAIN,
          api_token: JUDGEME_PRIVATE_API_TOKEN,
        }),
      );
      if (product?.id) {
        const { reviews } = await fetchWithCache<JudgemeReviewsData>(
          constructURL(JUDGEME_REVIEWS_API, {
            api_token: JUDGEME_PRIVATE_API_TOKEN,
            shop_domain: PUBLIC_STORE_DOMAIN,
            product_id: product?.id,
          }),
        );
        const reviewNumber = reviews.length || 1;
        const rating = reviews.reduce((a, c) => a + c.rating, 0) / reviewNumber;
        return { rating, reviewNumber, reviews };
      }
    }
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: <explanation> --- IGNORE ---
    console.log("Error fetching Judgeme product reviews", error.message);
  }
  return { rating: 0, reviewNumber: 0, reviews: [] };
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
