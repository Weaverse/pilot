import { useLoaderData } from "@remix-run/react";
import { HydrogenComponentSchema } from "@weaverse/hydrogen";
import { forwardRef, useState } from "react";
import { IconUser } from "~/components/icons";
import { StarRating } from "~/modules/star-rating";
import { ProductLoaderType } from "~/routes/($locale).products.$productHandle";

type ReviewListProps = {};
const reviewPerPage = 5;

const ReviewList = forwardRef<HTMLDivElement, ReviewListProps>((props, ref) => {
  let { ...rest } = props;
  const { judgemeReviews } = useLoaderData<ProductLoaderType>();
  const pageNumber = Math.ceil(judgemeReviews.reviews.length / reviewPerPage);
  const [page, setPage] = useState(0);

  const reviews = judgemeReviews.reviews.slice(
    page * reviewPerPage,
    (page + 1) * reviewPerPage
  );
  if (judgemeReviews.reviews.length === 0) {
    return (
      <div ref={ref} {...rest}>
        There are no reviews for this product yet
      </div>
    );
  }

  return (
    <div ref={ref} {...rest}>
      {/* User Reviews */}
      <div className="space-y-6">
        <div className="text-2xl font-bold text-gray-800 mb-4">
          Customer Reviews
        </div>
        {reviews.map((review, index) => (
          <div key={index} className="bg-gray-50 p-4 rounded shadow space-y-2">
            <div className="flex items-center mb-2">
              <IconUser className="w-10 h-10 rounded-full mr-3" />
              <div>
                <div className="font-semibold text-gray-800">
                  {review.reviewer.name}
                </div>
                <div className="flex items-center">
                  <StarRating rating={review.rating} />
                  <span className="ml-1 text-sm text-gray-600">
                    {review.rating.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
            <p className="font-bold">{review.title}</p>
            <p className="">{review.body}</p>
            <div className="flex gap-2 items-center">
              {review.pictures?.map((picture, index) => (
                <img
                  key={index}
                  src={picture.urls.compact}
                  alt={review.title}
                  className="w-20 aspect-square object-cover rounded"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      {pageNumber > 1 && (
        <div className="mt-6 flex justify-center gap-2">
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
      {/* Load More Button */}
      {/* <div className="mt-6 text-center">
        <Button
          variant="outline"
          //   onClick={fetchReviews}
          //   className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors duration-200"
        >
          Load More Reviews
        </Button>
      </div> */}
    </div>
  );
});

export default ReviewList;

export let schema: HydrogenComponentSchema = {
  type: "judgeme-review--list",
  title: "Judgeme Review list",
  inspector: [
    {
      group: "Review list",
      inputs: [],
    },
  ],
};
