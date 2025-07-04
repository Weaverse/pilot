import { Fragment, useState } from "react";
import { StarRating } from "~/components/star-rating";
import type { JudgemeReviewsData } from "~/utils/judgeme";

const REVIEWS_PER_PAGE = 5;

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US");
}

export function ReviewList({
  reviews: reviewsData,
}: {
  reviews: JudgemeReviewsData;
}) {
  const [page, setPage] = useState(0);
  const pageNumber = Math.ceil(reviewsData.reviews.length / REVIEWS_PER_PAGE);

  const reviews = reviewsData.reviews.slice(
    page * REVIEWS_PER_PAGE,
    (page + 1) * REVIEWS_PER_PAGE,
  );

  return (
    <div className="flex w-full flex-col gap-6 py-6 md:w-3/5 lg:w-2/3">
      <div className="flex flex-col gap-6">
        <span className="font-bold text-lg uppercase">
          Reviews ({reviewsData.reviewNumber})
        </span>
        {reviews.map(({ id, rating, reviewer, title, created_at, body }) => (
          <Fragment key={id}>
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex w-full flex-col gap-4 md:w-1/4">
                <div className="flex items-center gap-0.5">
                  <StarRating rating={rating} />
                </div>
                <div className="flex flex-col">
                  <p className="font-semibold">{reviewer.name}</p>
                  <p>{reviewer.email}</p>
                </div>
              </div>
              <div className="flex w-full flex-col gap-4 md:w-3/4">
                <div className="flex items-center justify-between">
                  <p className="font-bold">{title}</p>
                  <p>{formatDate(created_at)}</p>
                </div>
                <p className=" line-clamp-4 font-normal text-base">{body}</p>
              </div>
            </div>
            <hr className="border-line-subtle border-t" />
          </Fragment>
        ))}
      </div>
      {pageNumber > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pageNumber }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setPage(i)}
              className="rounded-md bg-gray-200 px-4 py-2 text-gray-800 transition-colors duration-200 hover:bg-gray-300 disabled:cursor-not-allowed disabled:bg-black disabled:text-white disabled:opacity-50"
              disabled={i === page}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
