import {
  CaretDoubleLeftIcon,
  CaretDoubleRightIcon,
  CaretLeftIcon,
  CaretRightIcon,
} from "@phosphor-icons/react";
import { cn } from "~/utils/cn";
import { useJudgemeStore } from ".";

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

  if (status !== "ok" || !data || data.lastPage <= 1) {
    return null;
  }

  const { currentPage, perPage } = paging;
  const { lastPage } = data;

  function handlePageChange(page: number) {
    if (page >= 1 && page <= lastPage && page !== currentPage) {
      setPaging({ currentPage: page, perPage });
    }
  }

  const visiblePages = getVisiblePages(currentPage, lastPage);

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
        disabled={currentPage === lastPage}
        className="py-2 px-1 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <CaretRightIcon className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={() => handlePageChange(lastPage)}
        disabled={currentPage === lastPage}
        className="py-2 px-1 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <CaretDoubleRightIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
