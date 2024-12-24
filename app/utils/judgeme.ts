import type { WeaverseClient } from "@weaverse/hydrogen";

type JudgemeProductData = {
  product: {
    id: string;
    handle: string;
  };
};

type JudgemeReviewType = {
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
  reviews: JudgemeReviewType[];
};

async function getInternalIdByHandle(
  api_token: string,
  shop_domain: string,
  handle: string,
  weaverseClient: WeaverseClient,
) {
  let api = `https://judge.me/api/v1/products/-1?${new URLSearchParams({
    api_token,
    shop_domain,
    handle,
  })}`;
  let data = (await weaverseClient.fetchWithCache(api)) as JudgemeProductData;
  return data?.product?.id;
}

export async function getJudgemeReviews(
  api_token: string,
  shop_domain: string,
  handle: string,
  weaverse: WeaverseClient,
) {
  let defaultData = {
    rating: 0,
    reviewNumber: 0,
    reviews: [],
  };
  if (!api_token) {
    return defaultData;
  }
  let internalId = await getInternalIdByHandle(
    api_token,
    shop_domain,
    handle,
    weaverse,
  );
  if (internalId) {
    let data = (await weaverse.fetchWithCache(
      `https://judge.me/api/v1/reviews?${new URLSearchParams({
        api_token,
        shop_domain,
        product_id: internalId,
      })}`,
    )) as JudgemeReviewsData;
    let reviews = data.reviews;
    let rating =
      reviews.reduce((acc, review) => acc + review.rating, 0) /
      (reviews.length || 1);
    return {
      rating,
      reviewNumber: reviews.length,
      reviews,
    };
  }
  return defaultData;
}

const JUDGE_ME_API = "https://judge.me/api/v1/reviews";

export async function createJudgeMeReview({
  formData,
  shopDomain,
  apiToken,
}: {
  shopDomain: string;
  apiToken: string;
  formData: FormData;
}) {
  let url = new URL(JUDGE_ME_API);
  url.searchParams.set("api_token", apiToken);
  url.searchParams.set("shop_domain", shopDomain);

  return await fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      shop_domain: shopDomain,
      platform: "shopify",
      ...formDataToObject(formData),
    }),
  });
}

function formDataToObject(formData: FormData) {
  let data = {};
  for (let [key, value] of formData.entries()) {
    data[key] = value;
  }
  return data;
}
