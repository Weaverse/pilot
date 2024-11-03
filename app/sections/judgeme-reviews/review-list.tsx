import { useState } from "react";
import { JudgemeReviewsData } from "~/lib/judgeme";
import { StarRating } from "~/modules/star-rating";

const reviewPerPage = 5;

export function ReviewList({judgemeReviews}: {judgemeReviews: JudgemeReviewsData}) {
  
  const pageNumber = Math.ceil(judgemeReviews.reviews.length / reviewPerPage);
  const [page, setPage] = useState(0);

  const reviews = judgemeReviews.reviews.slice(
    page * reviewPerPage,
    (page + 1) * reviewPerPage
  );
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB");
  };

  return (
    <div className="lg:w-2/3 md:w-3/5 w-full py-6 flex flex-col gap-6">
      {/* User Reviews */}
      <div className="flex flex-col gap-6">
        <span className="font-bold text-lg uppercase">
          Reviews ({judgemeReviews.reviewNumber})
        </span>
        {reviews.map((review, index) => (
          <>
            <div key={index} className="flex gap-4 flex-col md:flex-row">
              <div className="flex flex-col gap-4 md:w-1/4 w-full">
                <div className="flex items-center gap-0.5">
                  <StarRating rating={review.rating} />
                </div>
                <div className="flex flex-col">
                  <p className="font-semibold">{review.reviewer.name}</p>
                  <p>{review.reviewer.email}</p>
                </div>
              </div>
              <div className="md:w-3/4 w-full flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <p className="font-bold">{review.title}</p>
                  <p>{formatDate(review.created_at)}</p>
                </div>
                <p className=" font-normal text-base line-clamp-4">{review.body}</p>
              </div>
            </div>
            <hr className="border-t border-gray-300" />
          </>
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
