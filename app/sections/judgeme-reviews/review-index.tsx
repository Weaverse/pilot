import { createSchema } from "@weaverse/hydrogen";
import { forwardRef } from "react";
import { useLoaderData } from "react-router";
import type { loader as productRouteLoader } from "~/routes/($locale).products.$productHandle";
import ReviewForm from "./review-form";
import { ReviewList } from "./review-list";

let ReviewIndex = forwardRef<HTMLDivElement>((props, ref) => {
  let { productReviews } = useLoaderData<typeof productRouteLoader>();
  return (
    <div
      ref={ref}
      {...props}
      className="flex flex-col md:flex-row md:gap-10 gap-5"
    >
      <ReviewForm reviews={productReviews} />
      {productReviews.reviews.length > 0 ? (
        <ReviewList reviews={productReviews} />
      ) : null}
    </div>
  );
});

export default ReviewIndex;

export let schema = createSchema({
  type: "judgeme-review--index",
  title: "Judgeme Review",
  limit: 1,
});
