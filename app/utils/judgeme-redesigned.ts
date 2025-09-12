import type { AppLoadContext, LoaderFunctionArgs } from "react-router";
import { data } from "react-router";
import type {
  GetProductReviewsResponse,
  PaginationInfo,
  Review,
  ReviewsSummary,
} from "~/types/judgeme-redesigned";
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
  verified_buyer: boolean;
  featured: boolean;
  product_external_id: string;
};

const JUDGEME_PRODUCT_API = "https://judge.me/api/v1/products/-1";
const JUDGEME_REVIEWS_API = "https://judge.me/api/v1/reviews";

/**
 * Fetch product reviews from Judge.me API with filtering and pagination
 */
export async function getJudgeMeProductReviewsRedesigned({
  context,
  productHandle,
  page = 1,
  perPage = 10,
  sort = "newest",
  rating,
}: {
  context: AppLoadContext;
  productHandle: string;
  page?: number;
  perPage?: number;
  sort?: "newest" | "oldest" | "rating_high" | "rating_low";
  rating?: number;
}): Promise<GetProductReviewsResponse> {
  try {
    const { weaverse, env } = context;
    const { JUDGEME_PRIVATE_API_TOKEN, PUBLIC_STORE_DOMAIN } = env;

    if (!(JUDGEME_PRIVATE_API_TOKEN && PUBLIC_STORE_DOMAIN)) {
      throw new Error(
        "JUDGEME_PRIVATE_API_TOKEN or PUBLIC_STORE_DOMAIN is not configured.",
      );
    }

    const { fetchWithCache } = weaverse;

    // First, get the product ID from Judge.me
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

    // Fetch all reviews for the product
    const { reviews } = await fetchWithCache<{ reviews: JudgeMeReviewType[] }>(
      constructURL(JUDGEME_REVIEWS_API, {
        api_token: JUDGEME_PRIVATE_API_TOKEN,
        shop_domain: PUBLIC_STORE_DOMAIN,
        product_id: product?.id,
      }),
    );

    // Transform and filter reviews
    const transformedReviews: Review[] = reviews.map((review) => ({
      id: review.id,
      title: review.title,
      body: review.body,
      rating: review.rating,
      created_at: review.created_at,
      reviewer: {
        id: review.reviewer.id,
        name: review.reviewer.name,
        email: review.reviewer.email,
        phone: review.reviewer.phone,
      },
      pictures: review.pictures.map((pic) => ({
        id: `${review.id}-${pic.urls.original}`,
        urls: {
          original: pic.urls.original,
          small: pic.urls.small,
          compact: pic.urls.compact,
          huge: pic.urls.huge,
        },
        alt_text: `Review image for ${review.title}`,
      })),
      product_external_id: review.product_external_id,
      verified_buyer: review.verified_buyer,
      featured: review.featured,
    }));

    // Apply filters
    let filteredReviews = transformedReviews;

    // Filter by rating if specified
    if (rating && rating >= 1 && rating <= 5) {
      filteredReviews = filteredReviews.filter(
        (review) => review.rating === rating,
      );
    }

    // Sort reviews
    switch (sort) {
      case "newest":
        filteredReviews.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
        break;
      case "oldest":
        filteredReviews.sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        );
        break;
      case "rating_high":
        filteredReviews.sort((a, b) => b.rating - a.rating);
        break;
      case "rating_low":
        filteredReviews.sort((a, b) => a.rating - b.rating);
        break;
      case undefined:
        // Keep original order if no sort specified
        break;
    }

    // Calculate pagination
    const totalReviews = filteredReviews.length;
    const totalPages = Math.ceil(totalReviews / perPage);
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedReviews = filteredReviews.slice(startIndex, endIndex);

    // Calculate summary
    const averageRating =
      transformedReviews.length > 0
        ? transformedReviews.reduce((sum, review) => sum + review.rating, 0) /
          transformedReviews.length
        : 0;

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    transformedReviews.forEach((review) => {
      ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
    });

    const summary: ReviewsSummary = {
      totalReviews: transformedReviews.length,
      averageRating: Number(averageRating.toFixed(1)),
      ratingDistribution,
    };

    const pagination: PaginationInfo = {
      totalReviews,
      currentPage: page,
      totalPages,
      perPage: perPage,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };

    return {
      reviews: paginatedReviews,
      summary,
      pagination,
    };
  } catch (error) {
    // Return empty data on error
    return {
      reviews: [],
      summary: {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      },
      pagination: {
        totalReviews: 0,
        currentPage: 1,
        totalPages: 1,
        perPage: 10,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  }
}

/**
 * Loader function for product reviews route
 */
export async function loader({ request, context, params }: LoaderFunctionArgs) {
  const { productHandle } = params;

  if (!productHandle) {
    throw new Response("Product handle is required", { status: 400 });
  }

  const url = new URL(request.url);
  const page = Number.parseInt(url.searchParams.get("page") || "1", 10);
  const perPage = Number.parseInt(url.searchParams.get("perPage") || "10", 10);
  const sort =
    (url.searchParams.get("sort") as
      | "newest"
      | "oldest"
      | "rating_high"
      | "rating_low") || "newest";
  const rating = url.searchParams.get("rating")
    ? Number.parseInt(url.searchParams.get("rating")!, 10)
    : undefined;

  const reviewsData = await getJudgeMeProductReviewsRedesigned({
    context,
    productHandle,
    page,
    perPage,
    sort,
    rating,
  });

  return data(reviewsData);
}

/**
 * Action function for submitting reviews
 */
export async function action({ request, context }: LoaderFunctionArgs) {
  const formData = await request.formData();
  const { env } = context;
  const { JUDGEME_PRIVATE_API_TOKEN, PUBLIC_STORE_DOMAIN } = env;

  if (!(JUDGEME_PRIVATE_API_TOKEN && PUBLIC_STORE_DOMAIN)) {
    return data(
      {
        success: false,
        error: "Judge.me API is not configured",
      },
      { status: 500 },
    );
  }

  try {
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

    const result = await response.json();

    if (response.ok) {
      return data({
        success: true,
        review: result.review,
      });
    }
    return data(
      {
        success: false,
        error: result.error || "Failed to submit review",
      },
      { status: 400 },
    );
  } catch (error) {
    return data(
      {
        success: false,
        error: "Failed to submit review. Please try again.",
      },
      { status: 500 },
    );
  }
}

function formDataToObject(formData: FormData) {
  const data: Record<string, any> = {};
  for (const [key, value] of formData.entries()) {
    data[key] = value;
  }
  return data;
}
