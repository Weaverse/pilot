import { HydrogenComponentSchema } from "@weaverse/hydrogen";
import { forwardRef } from "react";
import ReviewForm from "./review-form";
import { ReviewList } from "./review-list";

type ReviewIndexProps = {};
const ReviewIndex = forwardRef<HTMLDivElement, ReviewIndexProps>((props, ref) => {
  let { ...rest } = props;
  
  return (
    <div ref={ref} {...rest} className="flex flex-col md:flex-row md:gap-10 gap-5">
      <ReviewForm/>
      <ReviewList/>
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
