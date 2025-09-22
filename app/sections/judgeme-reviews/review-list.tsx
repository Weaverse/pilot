import {
  CaretDoubleLeftIcon,
  CaretDoubleRightIcon,
  CaretLeftIcon,
  CaretRightIcon,
} from "@phosphor-icons/react";
import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";
import { cn } from "~/utils/cn";
import { useJudgemeStore } from ".";
import { ReviewItem } from "./review-item";

function getVisiblePages(
  currentPage: number,
  lastPage: number,
): (number | string)[] {
  const DELTA = 1;
  const range: number[] = [];
  const rangeWithDots: (number | string)[] = [];

  for (
    let i = Math.max(2, currentPage - DELTA);
    i <= Math.min(lastPage - 1, currentPage + DELTA);
    i++
  ) {
    range.push(i);
  }

  if (currentPage - DELTA > 2) {
    rangeWithDots.push(1, "...");
  } else {
    rangeWithDots.push(1);
  }

  rangeWithDots.push(...range);

  if (currentPage + DELTA < lastPage - 1) {
    rangeWithDots.push("...", lastPage);
  } else if (lastPage > 1) {
    rangeWithDots.push(lastPage);
  }

  return rangeWithDots;
}

export function ReviewsPagination() {
  const { status, paging, data, setPaging } = useJudgemeStore();

  if (status !== "ok" || !data || data.totalPage <= 1) {
    return null;
  }

  const { currentPage, perPage } = paging;
  const { totalPage } = data;

  function handlePageChange(page: number) {
    if (page >= 1 && page <= totalPage && page !== currentPage) {
      setPaging({ currentPage: page, perPage });
    }
  }

  const visiblePages = getVisiblePages(currentPage, totalPage);

  return (
    <div className="flex items-center justify-center gap-1.5 mt-6">
      <button
        type="button"
        onClick={() => handlePageChange(1)}
        disabled={currentPage === 1}
        className="py-2 px-1 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <CaretDoubleLeftIcon className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="py-2 px-1 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <CaretLeftIcon className="h-4 w-4" />
      </button>

      {visiblePages.map((page, index) =>
        page === "..." ? (
          <span key={`dots-${index}`} className="p-2 text-gray-500">
            ...
          </span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => handlePageChange(page as number)}
            className={cn(
              "p-2 underline-offset-4 leading-4",
              currentPage === page
                ? "underline font-semibold"
                : "hover:underline",
            )}
          >
            {page}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPage}
        className="py-2 px-1 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <CaretRightIcon className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={() => handlePageChange(totalPage)}
        disabled={currentPage === totalPage}
        className="py-2 px-1 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <CaretDoubleRightIcon className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function ReviewList(
  props: HydrogenComponentProps & { ref: React.Ref<HTMLDivElement> },
) {
  const { ref, ...rest } = props;
  const { status, data } = useJudgemeStore();

  if (data?.reviews?.length) {
    return (
      <div ref={ref} {...rest}>
        <div className="flex w-full flex-col gap-6 py-6 md:col-span-2">
          <div className="space-y-8 divide-y divide-gray-200 relative">
            {data.reviews.map((review) => (
              <ReviewItem key={review.id} review={review} className="pb-8" />
            ))}
            {status === "page-loading" && (
              <div className="absolute inset-0 bg-white/80 z-10" />
            )}
          </div>
          <ReviewsPagination />
        </div>
      </div>
    );
  }
  return null;
}

export const schema = createSchema({
  type: "judgeme-reviews--list",
  title: "Reviews list",
  settings: [],
  presets: {},
});
