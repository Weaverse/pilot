import { createSchema } from "@weaverse/hydrogen";
import { forwardRef } from "react";
import { useLoaderData } from "react-router";
import type { loader as productRouteLoader } from "~/routes/($locale).products.$productHandle";
import ReviewForm from "./review-form";
import { ReviewList } from "./review-list";

const ReviewIndex = forwardRef<HTMLDivElement>((props, ref) => {
  const { productReviews } = useLoaderData<typeof productRouteLoader>();
  return (
    <div
      ref={ref}
      {...props}
      className="flex flex-col gap-5 md:flex-row md:gap-10"
    >
      <ReviewForm reviews={productReviews} />
      {productReviews.reviews.length > 0 ? (
        <ReviewList reviews={productReviews} />
      ) : null}
    </div>
  );
});

export default ReviewIndex;

export const schema = createSchema({
  type: "judgeme-review--index",
  title: "Judgeme Review",
  limit: 1,
});
