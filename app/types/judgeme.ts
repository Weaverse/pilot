export interface JudgemeStarsRatingData {
  totalReviews: number;
  averageRating: number;
  badge: string;
}

export type JudgemeProduct = {
  id: number;
  external_id: number;
  handle: string;
  [key: string]: unknown;
};

export type JudgeMeReviewType = {
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
  averageRating: number;
  totalReviews: number;
  ratingDistribution: JudgemeRatingDistribution[];
  currentPage: number;
  lastPage: number;
  perPage: number;
  reviews: JudgeMeReviewType[];
};

export type JudgemeRatingDistribution = {
  rating: number;
  frequency: number;
  percentage: number;
};

export type JudgemeWidgetData = Pick<
  JudgemeReviewsData,
  "averageRating" | "totalReviews" | "ratingDistribution" | "lastPage"
>;
