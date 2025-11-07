import {
  CaretDoubleLeftIcon,
  CaretDoubleRightIcon,
  CaretLeftIcon,
  CaretRightIcon,
} from "@phosphor-icons/react";
import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";
import { useEffect } from "react";
import { cn } from "~/utils/cn";
import { ReviewItem, type ReviewItemProps } from "./review-item";
import { useJudgemeStore } from "./store";

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
    <div className="mt-6 flex items-center justify-center gap-1.5">
      <button
        type="button"
        onClick={() => handlePageChange(1)}
        disabled={currentPage === 1}
        className="px-1 py-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <CaretDoubleLeftIcon className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-1 py-2 disabled:cursor-not-allowed disabled:opacity-50"
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
              "p-2 leading-4 underline-offset-4",
              currentPage === page
                ? "font-semibold underline"
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
        className="px-1 py-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <CaretRightIcon className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={() => handlePageChange(totalPage)}
        disabled={currentPage === totalPage}
        className="px-1 py-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <CaretDoubleRightIcon className="h-4 w-4" />
      </button>
    </div>
  );
}

interface ReviewListProps
  extends HydrogenComponentProps,
    Omit<ReviewItemProps, "review"> {
  ref: React.Ref<HTMLDivElement>;
  reviewsPerPage?: number;
}

export default function ReviewList(props: ReviewListProps) {
  const {
    ref,
    showReviewerName = true,
    showReviewerEmail = true,
    reviewerEmailFormat = "partial",
    showReviewTitle = true,
    showReviewDate = true,
    reviewsPerPage = 5,
    ...rest
  } = props;
  const { status, data, setPaging, paging } = useJudgemeStore();

  // Update store perPage when reviewsPerPage prop changes
  useEffect(() => {
    if (paging.perPage !== reviewsPerPage) {
      setPaging({ currentPage: 1, perPage: reviewsPerPage });
    }
  }, [reviewsPerPage, paging.perPage, setPaging]);

  if (data?.reviews?.length) {
    return (
      <div ref={ref} {...rest}>
        <div className="flex w-full flex-col gap-6 py-6 md:col-span-2">
          <div className="relative space-y-8 divide-y divide-gray-200">
            {data.reviews.map((review) => (
              <ReviewItem
                key={review.id}
                review={review}
                className="pb-8"
                showReviewerName={showReviewerName}
                showReviewerEmail={showReviewerEmail}
                reviewerEmailFormat={reviewerEmailFormat}
                showReviewTitle={showReviewTitle}
                showReviewDate={showReviewDate}
              />
            ))}
            {status === "page-loading" && (
              <div className="absolute inset-0 z-10 bg-white/80" />
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
  settings: [
    {
      group: "Display Settings",
      inputs: [
        {
          type: "switch",
          name: "showReviewerName",
          label: "Show reviewer name",
          defaultValue: true,
        },
        {
          type: "switch",
          name: "showReviewerEmail",
          label: "Show reviewer email",
          defaultValue: true,
        },
        {
          type: "select",
          name: "reviewerEmailFormat",
          label: "Reviewer email format",
          defaultValue: "partial",
          configs: {
            options: [
              { label: "Partial (e.g., joh***@email.com)", value: "partial" },
              { label: "Full email address", value: "full" },
            ],
          },
          condition: "showReviewerEmail.eq.true",
        },
        {
          type: "switch",
          name: "showReviewTitle",
          label: "Show review title",
          defaultValue: true,
        },
        {
          type: "switch",
          name: "showReviewDate",
          label: "Show review date",
          defaultValue: true,
        },
        {
          type: "range",
          name: "reviewsPerPage",
          label: "Reviews per page",
          defaultValue: 5,
          configs: {
            min: 5,
            max: 10,
            step: 1,
          },
        },
      ],
    },
  ],
});
