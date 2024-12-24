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

export async function createJudgemeReview(
  api_token: string,
  shop_domain: string,
  formData: FormData,
) {
  if (!api_token) {
    return {
      error: "Missing JUDGEME_PRIVATE_API_TOKEN",
    };
  }
  let body = formDataToObject(formData);
  let url = new URL(JUDGE_ME_API);
  url.searchParams.append("api_token", api_token);
  url.searchParams.append("shop_domain", shop_domain);
  let payload = JSON.stringify({
    shop_domain,
    platform: "shopify",
    ...body,
  });

  try {
    let response = await fetch(JUDGE_ME_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: payload,
    });
    let status = response.status;
    if (response.ok) {
      return { success: true, status };
    }
    return {
      success: false,
      message: "Something went wrong! Please try again.",
      status,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Something went wrong! Please try again.",
      status: 500,
    };
  }
}

function formDataToObject(formData: FormData) {
  let data = {};
  for (let [key, value] of formData.entries()) {
    data[key] = value;
  }
  return data;
}
