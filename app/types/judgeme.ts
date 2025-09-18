export interface JudgemeStarsRatingData {
  totalReviews: number;
  averageRating: number;
  badge: string;
}

export type JudgemeStarsRatingApiResponse =
  | {
      ok: true;
      data: JudgemeStarsRatingData;
    }
  | {
      ok: false;
      error: string;
    };

export type JudgemeProductData = {
  product: {
    id: string;
    handle: string;
  };
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
  rating: number;
  totalReviews: number;
  reviews: JudgeMeReviewType[];
};

export type JudgemeBadgeInternalApiResponse = {
  product_external_id: number;
  badge: string;
};
