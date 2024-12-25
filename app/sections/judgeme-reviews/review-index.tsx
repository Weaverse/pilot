import { useLoaderData } from "@remix-run/react";
import type { HydrogenComponentSchema } from "@weaverse/hydrogen";
import { forwardRef } from "react";
import type { loader as productRouteLoader } from "~/routes/($locale).products.$productHandle";
import ReviewForm from "./review-form";
import { ReviewList } from "./review-list";

let ReviewIndex = forwardRef<HTMLDivElement>((props, ref) => {
  let { judgemeReviews } = useLoaderData<typeof productRouteLoader>();
  return (
    <div
      ref={ref}
      {...props}
      className="flex flex-col md:flex-row md:gap-10 gap-5"
    >
      <ReviewForm judgemeReviews={judgemeReviews} />
      {judgemeReviews.reviews.length > 0 ? (
        <ReviewList judgemeReviews={judgemeReviews} />
      ) : null}
    </div>
  );
});

export default ReviewIndex;

export let schema: HydrogenComponentSchema = {
  type: "judgeme-review--index",
  title: "Judgeme Review",
  limit: 1,
  inspector: [
    {
      group: "Review",
      inputs: [],
    },
  ],
};
