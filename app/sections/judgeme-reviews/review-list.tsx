import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";
import { cn } from "~/utils/cn";
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
        <div className="flex w-full flex-col gap-6 py-6 md:col-span-2">
          <div className="space-y-8 divide-y divide-gray-200">
            {Array.from({ length: 3 }, (_, i) => (
              <ReviewSkeleton key={i} className="pb-8" />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ReviewSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "group flex flex-col md:flex-row gap-4 md:gap-6 animate-pulse",
        className,
      )}
    >
      {/* Left column - Reviewer info skeleton */}
      <div className="space-y-3 w-full flex-shrink-0 md:w-1/4">
        {/* Star rating skeleton */}
        <div className="flex gap-1">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="h-4 w-4 bg-gray-200 rounded" />
          ))}
        </div>
        <div className="space-y-2">
          {/* Reviewer name skeleton */}
          <div className="h-5 w-32 bg-gray-200 rounded" />
          {/* Email skeleton */}
          <div className="h-4 w-40 bg-gray-200 rounded" />
        </div>
      </div>

      {/* Right column - Review content skeleton */}
      <div className="grow space-y-4">
        {/* Review title skeleton */}
        <div className="h-5 w-48 bg-gray-200 rounded" />

        {/* Review body skeleton */}
        <div className="space-y-2">
          <div className="h-4 w-full bg-gray-200 rounded" />
          <div className="h-4 w-3/4 bg-gray-200 rounded" />
          <div className="h-4 w-5/6 bg-gray-200 rounded" />
        </div>

        {/* Review images skeleton */}
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 2 }, (_, i) => (
            <div
              key={i}
              className="h-16 w-16 bg-gray-200 rounded border border-gray-200"
            />
          ))}
        </div>

        {/* Date skeleton */}
        <div className="h-3 w-24 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

export const schema = createSchema({
  type: "judgeme-reviews--list",
  title: "Reviews list",
  settings: [],
  presets: {},
});
