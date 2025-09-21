import type {
  JudgemeRatingDistribution,
  JudgemeStarsRatingData,
  JudgemeWidgetData,
} from "~/types/judgeme";

const WIDGET_REGEX =
  /class=['"]jdgm-rev-widg['"][^>]*data-average-rating=['"]([^'"]*)['"]/;
const REVIEWS_REGEX = /data-number-of-reviews=['"]([^'"]*)['"]/;
const HISTOGRAM_ROW_REGEX =
  /class=['"]jdgm-histogram__row['"][^>]*data-rating=['"](\d+)['"][^>]*data-frequency=['"](\d+)['"][^>]*data-percentage=['"](\d+)['"][^>]*>/g;

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
