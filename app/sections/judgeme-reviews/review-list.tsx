import { Fragment, useState } from "react";
import { StarRating } from "~/components/star-rating";
import type { JudgemeReviewsData } from "~/utils/judgeme";

const REVIEWS_PER_PAGE = 5;

function formatDate(dateString: string) {
  let date = new Date(dateString);
  return date.toLocaleDateString("en-US");
}

export function ReviewList({
  reviews: reviewsData,
}: {
  reviews: JudgemeReviewsData;
}) {
  let [page, setPage] = useState(0);
  let pageNumber = Math.ceil(reviewsData.reviews.length / REVIEWS_PER_PAGE);

  let reviews = reviewsData.reviews.slice(
    page * REVIEWS_PER_PAGE,
    (page + 1) * REVIEWS_PER_PAGE,
  );

  return (
    <div className="lg:w-2/3 md:w-3/5 w-full py-6 flex flex-col gap-6">
      <div className="flex flex-col gap-6">
        <span className="font-bold text-lg uppercase">
          Reviews ({reviewsData.reviewNumber})
        </span>
        {reviews.map(({ id, rating, reviewer, title, created_at, body }) => (
          <Fragment key={id}>
            <div className="flex gap-4 flex-col md:flex-row">
              <div className="flex flex-col gap-4 md:w-1/4 w-full">
                <div className="flex items-center gap-0.5">
                  <StarRating rating={rating} />
                </div>
                <div className="flex flex-col">
                  <p className="font-semibold">{reviewer.name}</p>
                  <p>{reviewer.email}</p>
                </div>
              </div>
              <div className="md:w-3/4 w-full flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <p className="font-bold">{title}</p>
                  <p>{formatDate(created_at)}</p>
                </div>
                <p className=" font-normal text-base line-clamp-4">{body}</p>
              </div>
            </div>
            <hr className="border-t border-line-subtle" />
          </Fragment>
        ))}
      </div>
      {pageNumber > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pageNumber }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-black disabled:text-white"
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
