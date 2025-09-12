export type JudgemeStarsRatingData = {
  totalReviews: number;
  averageRating: number;
  badge: string;
};

export type JudgemeStarsRatingApiResponse =
  | {
      ok: true;
      data: JudgemeStarsRatingData;
    }
  | {
      ok: false;
      error: string;
    };
