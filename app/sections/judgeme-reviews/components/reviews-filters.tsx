import { CaretDownIcon } from "@phosphor-icons/react";
import { forwardRef, useState } from "react";
import { Button } from "~/components/button";
import type { ReviewsFiltersProps } from "~/types/judgeme-redesigned";
import { cn } from "~/utils/cn";

export const ReviewsFilters = forwardRef<HTMLDivElement, ReviewsFiltersProps>(
  (
    {
      currentFilter,
      onSortChange,
      onRatingChange,
      totalReviews,
      isLoading = false,
    },
    ref,
  ) => {
    const [showRatingDropdown, setShowRatingDropdown] = useState(false);
    const [showSortDropdown, setShowSortDropdown] = useState(false);

    const ratingOptions = [
      { value: undefined, label: "All ratings" },
      { value: 5, label: "5 stars" },
      { value: 4, label: "4 stars" },
      { value: 3, label: "3 stars" },
      { value: 2, label: "2 stars" },
      { value: 1, label: "1 star" },
    ];

    const sortOptions = [
      { value: "newest", label: "Newest first" },
      { value: "oldest", label: "Oldest first" },
      { value: "rating_high", label: "Highest rating" },
      { value: "rating_low", label: "Lowest rating" },
    ] as const;

    const handleRatingChangeInternal = (rating: number | undefined) => {
      onRatingChange(rating);
      setShowRatingDropdown(false);
    };

    const handleSortChangeInternal = (sortBy: typeof currentFilter.sortBy) => {
      onSortChange(sortBy);
      setShowSortDropdown(false);
    };

    const currentRatingLabel =
      ratingOptions.find((option) => option.value === currentFilter.rating)
        ?.label || "All ratings";
    const currentSortLabel =
      sortOptions.find((option) => option.value === currentFilter.sortBy)
        ?.label || "Newest first";

    return (
      <div
        ref={ref}
        data-testid="reviews-filters"
        className="flex flex-col items-start justify-between gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 shadow-sm sm:flex-row sm:items-center dark:border-gray-700 dark:bg-gray-800/50"
      >
        {/* Filter and sort controls */}
        <div className="flex flex-1 flex-wrap items-center gap-3">
          {/* Rating filter */}
          <div className="relative">
            <Button
              data-testid="rating-filter"
              variant="secondary"
              onClick={() => setShowRatingDropdown(!showRatingDropdown)}
              disabled={isLoading}
              className="flex min-w-[120px] items-center justify-between gap-2 border-gray-300 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600"
              aria-expanded={showRatingDropdown}
              aria-haspopup="listbox"
            >
              <span data-testid="active-filter" className="font-medium text-sm">
                {currentRatingLabel}
              </span>
              <CaretDownIcon
                className={cn(
                  "h-4 w-4 transition-transform",
                  showRatingDropdown && "rotate-180",
                )}
              />
            </Button>

            {showRatingDropdown && (
              <div className="absolute top-full left-0 z-50 mt-1 w-full min-w-[160px] rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                <ul className="py-1">
                  {ratingOptions.map((option) => (
                    <li key={option.value || "all"}>
                      <button
                        data-testid={
                          option.value
                            ? `filter-${option.value}-stars`
                            : "filter-all"
                        }
                        data-testid-option="filter-option"
                        className={cn(
                          "w-full px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-700",
                          currentFilter.rating === option.value &&
                            "bg-blue-50 font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-300",
                        )}
                        onClick={() => handleRatingChangeInternal(option.value)}
                        role="option"
                        aria-selected={currentFilter.rating === option.value}
                      >
                        {option.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sort dropdown */}
          <div className="relative">
            <Button
              data-testid="sort-dropdown"
              variant="secondary"
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              disabled={isLoading}
              className="flex min-w-[140px] items-center justify-between gap-2 border-gray-300 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600"
              aria-expanded={showSortDropdown}
              aria-haspopup="listbox"
            >
              <span data-testid="current-sort" className="font-medium text-sm">
                {currentSortLabel}
              </span>
              <CaretDownIcon
                className={cn(
                  "h-4 w-4 transition-transform",
                  showSortDropdown && "rotate-180",
                )}
              />
            </Button>

            {showSortDropdown && (
              <div className="absolute top-full left-0 z-50 mt-1 w-full min-w-[160px] rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                <ul className="py-1">
                  {sortOptions.map((option) => (
                    <li key={option.value}>
                      <button
                        data-testid={`sort-${option.value.replace("_", "-")}`}
                        className={cn(
                          "w-full px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-700",
                          currentFilter.sortBy === option.value &&
                            "bg-blue-50 font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-300",
                        )}
                        onClick={() => handleSortChangeInternal(option.value)}
                        role="option"
                        aria-selected={currentFilter.sortBy === option.value}
                      >
                        {option.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Clear filters */}
          {currentFilter.rating !== undefined && (
            <Button
              data-testid="clear-filters"
              variant="outline"
              onClick={() => handleRatingChangeInternal(undefined)}
              disabled={isLoading}
              className="border-gray-300 bg-white text-sm transition-colors hover:border-gray-400 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600"
            >
              Clear filters
            </Button>
          )}
        </div>

        {/* Results count */}
        <div className="whitespace-nowrap font-medium text-gray-600 text-sm dark:text-gray-400">
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg
                className="h-4 w-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Loading...
            </span>
          ) : (
            <span>
              Showing{" "}
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {totalReviews}
              </span>{" "}
              {totalReviews === 1 ? "review" : "reviews"}
            </span>
          )}
        </div>

        {/* Click outside handler */}
        {(showRatingDropdown || showSortDropdown) && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => {
              setShowRatingDropdown(false);
              setShowSortDropdown(false);
            }}
          />
        )}
      </div>
    );
  },
);

ReviewsFilters.displayName = "ReviewsFilters";
