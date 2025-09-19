import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";
import { useJudgemeStore } from ".";
import { ReviewItem } from "./review-item";

export default function ReviewList(
  props: HydrogenComponentProps & { ref: React.Ref<HTMLDivElement> },
) {
  const { ref, ...rest } = props;
  const { status, data } = useJudgemeStore();
  // const [page, setPage] = useState(0);
  // const pageNumber = Math.ceil(data.reviews.length / REVIEWS_PER_PAGE);

  return (
    <div ref={ref} {...rest}>
      {status === "ok" && data?.reviews?.length ? (
        <div className="flex w-full flex-col gap-6 py-6 md:col-span-2">
          <div className="space-y-8 divide-y divide-gray-200">
            {data.reviews.map((review) => (
              <ReviewItem key={review.id} review={review} className="pb-8" />
            ))}
          </div>
          {/* {pageNumber > 1 && (
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
      )} */}
        </div>
      ) : status === "loading" ? (
        <div>Loading reviews...</div>
      ) : null}
    </div>
  );
}

export const schema = createSchema({
  type: "judgeme-reviews--list",
  title: "Reviews list",
  settings: [],
  presets: {},
});
