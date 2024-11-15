import { HydrogenComponentSchema } from "@weaverse/hydrogen";
import { forwardRef } from "react";
import ReviewForm from "./review-form";
import { ReviewList } from "./review-list";
import { useLoaderData } from "@remix-run/react";
import { ProductLoaderType } from "~/routes/($locale).products.$productHandle";

type ReviewIndexProps = {};
const ReviewIndex = forwardRef<HTMLDivElement, ReviewIndexProps>((props, ref) => {
  let { ...rest } = props;
  const { judgemeReviews } = useLoaderData<ProductLoaderType>();
  return (
    <div ref={ref} {...rest} className="flex flex-col md:flex-row md:gap-10 gap-5">
      <ReviewForm judgemeReviews={judgemeReviews}/>
      {judgemeReviews.reviews.length > 0 && (
        <ReviewList judgemeReviews={judgemeReviews}/>
      )}
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
