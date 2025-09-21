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

export type JudgemeReviewImage = {
  urls: {
    original: string;
    small: string;
    compact: string;
    huge: string;
  };
  hidden: boolean;
};

export type JudgeMeReviewType = {
  id: string;
  title: string;
  created_at: string;
  body: string;
  rating: number;
  product_external_id: number;
  reviewer: {
    id: number;
    email: string;
    name: string;
    phone: string;
    accepts_marketing: boolean;
  };
  source: string;
  curated: boolean;
  published: boolean;
  hidden: boolean;
  verified: boolean;
  featured: boolean;
  pinned: boolean;
  has_published_pictures: boolean;
  has_published_videos: boolean;
  pictures: JudgemeReviewImage[];
  ip_address: string;
};

export type JudgemeReviewsData = {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: JudgemeRatingDistribution[];
  currentPage: number;
  totalPage: number;
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
  "averageRating" | "totalReviews" | "ratingDistribution"
>;
