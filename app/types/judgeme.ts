export interface JudgemeBadgeData {
  totalReviews: number;
  averageRating: number;
  badge: string;
}

export type JudgemeBadgeApiResponse =
  | {
      ok: true;
      data: JudgemeBadgeData;
    }
  | {
      ok: false;
      error: string;
    };
