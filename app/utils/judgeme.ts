import type {
  JudgemeRatingDistribution,
  JudgemeStarsRatingData,
  JudgemeWidgetData,
} from "~/types/judgeme";
import { constructURL } from "./misc";

const JUDGEME_REVIEWS_API = "https://judge.me/api/v1/reviews";

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

const WIDGET_REGEX =
  /class=['"]jdgm-rev-widg['"][^>]*data-average-rating=['"]([^'"]*)['"]/;
const REVIEWS_REGEX = /data-number-of-reviews=['"]([^'"]*)['"]/;
const HISTOGRAM_ROW_REGEX =
  /class=['"]jdgm-histogram__row['"][^>]*data-rating=['"](\d+)['"][^>]*data-frequency=['"](\d+)['"][^>]*data-percentage=['"](\d+)['"][^>]*>/g;
const LAST_PAGE_REGEX =
  /class=['"]jdgm-paginate__page jdgm-paginate__last-page['"][^>]*data-page=['"](\d+)['"][^>]*>/;

export function parseJudgemeWidgetHTML(html: string): JudgemeWidgetData {
  const ratingDistribution: JudgemeRatingDistribution[] = [];
  let match: RegExpExecArray | null;
  match = HISTOGRAM_ROW_REGEX.exec(html);
  while (match !== null) {
    const rating = Number.parseInt(match[1], 10);
    const frequency = Number.parseInt(match[2], 10);
    const percentage = Number.parseInt(match[3], 10);
    ratingDistribution.push({
      rating,
      frequency,
      percentage,
    });
    match = HISTOGRAM_ROW_REGEX.exec(html);
  }

  return {
    averageRating: Number.parseFloat(html.match(WIDGET_REGEX)?.[1] || "0"),
    totalReviews: Number.parseInt(html.match(REVIEWS_REGEX)?.[1] || "0", 10),
    ratingDistribution: ratingDistribution.sort((a, b) => b.rating - a.rating),
    lastPage: Number.parseInt(html.match(LAST_PAGE_REGEX)?.[1] || "1", 10),
  };
}

const AVG_RATING_REGEX = /data-average-rating=['"]([^'"]+)['"]/;
const NUM_REVIEWS_REGEX = /data-number-of-reviews=['"]([^'"]+)['"]/;

export function parseBadgeHtml(html: string): JudgemeStarsRatingData {
  return {
    totalReviews: Number.parseInt(
      html.match(NUM_REVIEWS_REGEX)?.[1] || "0",
      10,
    ),
    averageRating: Number.parseFloat(html.match(AVG_RATING_REGEX)?.[1] || "0"),
    badge: html,
  };
}
