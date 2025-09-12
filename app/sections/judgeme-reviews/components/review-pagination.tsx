import { cva, type VariantProps } from "class-variance-authority";
import { ChevronLeft, ChevronRight, Ellipsis } from "lucide-react";
import type React from "react";
import { forwardRef } from "react";
import { cn } from "~/utils/cn";

const paginationVariants = cva("flex items-center justify-center gap-1", {
  variants: {
    variant: {
      default: "text-gray-600 dark:text-gray-400",
      compact: "text-sm",
    },
    size: {
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
});

const paginationButtonVariants = cva(
  "inline-flex items-center justify-center rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "hover:bg-gray-100 focus:ring-blue-500 dark:hover:bg-gray-700",
        compact: "hover:bg-gray-50 focus:ring-blue-500 dark:hover:bg-gray-800",
      },
      size: {
        sm: "h-8 w-8 text-sm",
        md: "h-10 w-10 text-base",
        lg: "h-12 w-12 text-lg",
      },
      isActive: {
        true: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-700",
        false: "",
      },
      isDisabled: {
        true: "pointer-events-none cursor-not-allowed opacity-50",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      isActive: false,
      isDisabled: false,
    },
  },
);

export type PaginationItem = {
  type: "page" | "ellipsis" | "prev" | "next";
  label?: string | number;
  value?: number;
  isActive?: boolean;
  isDisabled?: boolean;
};

export interface ReviewPaginationProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof paginationVariants> {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showPageNumbers?: boolean;
  maxPageButtons?: number;
  showEllipsis?: boolean;
  labels?: {
    previous?: string;
    next?: string;
    page?: string;
    of?: string;
  };
}

export const ReviewPagination = forwardRef<HTMLElement, ReviewPaginationProps>(
  (
    {
      currentPage,
      totalPages,
      onPageChange,
      variant = "default",
      size = "md",
      showPageNumbers = true,
      maxPageButtons = 5,
      showEllipsis = true,
      labels = {
        previous: "Previous page",
        next: "Next page",
        page: "Page",
        of: "of",
      },
      className,
      ...props
    },
    ref,
  ) => {
    // Ensure totalPages is never undefined or less than 1
    const safeTotalPages = Math.max(1, totalPages || 1);
    const safeCurrentPage = Math.max(1, Math.min(currentPage || 1, safeTotalPages));
    
    const handlePrevious = () => {
      if (safeCurrentPage > 1) {
        onPageChange(safeCurrentPage - 1);
      }
    };

    const handleNext = () => {
      if (safeCurrentPage < safeTotalPages) {
        onPageChange(safeCurrentPage + 1);
      }
    };

    const handlePageClick = (page: number) => {
      onPageChange(page);
    };

    const generatePaginationItems = (): PaginationItem[] => {
      const items: PaginationItem[] = [];

      if (safeTotalPages <= 1) {
        return items;
      }

      if (safeTotalPages <= maxPageButtons) {
        // Show all pages
        for (let i = 1; i <= safeTotalPages; i++) {
          items.push({
            type: "page",
            label: i,
            value: i,
            isActive: i === safeCurrentPage,
          });
        }
      } else {
        // Complex pagination logic with ellipsis
        const startPage = Math.max(
          1,
          safeCurrentPage - Math.floor(maxPageButtons / 2),
        );
        const endPage = Math.min(safeTotalPages, startPage + maxPageButtons - 1);
        const adjustedStartPage = Math.max(1, endPage - maxPageButtons + 1);

        // Always show first page
        if (adjustedStartPage > 1) {
          items.push({
            type: "page",
            label: 1,
            value: 1,
            isActive: safeCurrentPage === 1,
          });

          if (adjustedStartPage > 2 && showEllipsis) {
            items.push({
              type: "ellipsis",
            });
          }
        }

        // Show middle pages
        for (let i = adjustedStartPage; i <= endPage; i++) {
          items.push({
            type: "page",
            label: i,
            value: i,
            isActive: i === safeCurrentPage,
          });
        }

        // Always show last page
        if (endPage < safeTotalPages) {
          if (endPage < safeTotalPages - 1 && showEllipsis) {
            items.push({
              type: "ellipsis",
            });
          }

          items.push({
            type: "page",
            label: safeTotalPages,
            value: safeTotalPages,
            isActive: safeCurrentPage === safeTotalPages,
          });
        }
      }

      return items;
    };

    const renderPaginationItem = (item: PaginationItem) => {
      switch (item.type) {
        case "prev":
          return (
            <button
              key="prev"
              type="button"
              onClick={handlePrevious}
              disabled={safeCurrentPage === 1}
              aria-label={labels.previous}
              className={cn(
                paginationButtonVariants({
                  variant,
                  size,
                  isDisabled: safeCurrentPage === 1,
                }),
                "mr-2",
              )}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          );

        case "next":
          return (
            <button
              key="next"
              type="button"
              onClick={handleNext}
              disabled={safeCurrentPage === safeTotalPages}
              aria-label={labels.next}
              className={cn(
                paginationButtonVariants({
                  variant,
                  size,
                  isDisabled: safeCurrentPage === safeTotalPages,
                }),
                "ml-2",
              )}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          );

        case "page":
          return (
            <button
              key={`page-${item.value}`}
              type="button"
              onClick={() => handlePageClick(item.value!)}
              disabled={item.isDisabled}
              aria-label={`${labels.page} ${item.value}`}
              aria-current={item.isActive ? "page" : undefined}
              className={cn(
                paginationButtonVariants({
                  variant,
                  size,
                  isActive: item.isActive,
                  isDisabled: item.isDisabled,
                }),
              )}
            >
              {item.label}
            </button>
          );

        case "ellipsis":
          return (
            <span
              key="ellipsis"
              className={cn("inline-flex items-center justify-center px-3", {
                "h-8 text-sm": size === "sm",
                "h-10 text-base": size === "md" || size === undefined,
                "h-12 text-lg": size === "lg",
              })}
              aria-hidden="true"
            >
              <Ellipsis className="h-4 w-4" />
            </span>
          );

        default:
          return null;
      }
    };

    const paginationItems = generatePaginationItems();

    if (safeTotalPages <= 1) {
      return null;
    }

    return (
      <nav
        ref={ref}
        aria-label="Reviews pagination"
        className={cn(paginationVariants({ variant, size }), className)}
        {...props}
      >
        <button
          key="prev-main"
          type="button"
          onClick={handlePrevious}
          disabled={safeCurrentPage === 1}
          aria-label={labels.previous}
          className={cn(
            paginationButtonVariants({
              variant,
              size,
              isDisabled: safeCurrentPage === 1,
            }),
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {showPageNumbers && paginationItems.map(renderPaginationItem)}

        <button
          key="next-main"
          type="button"
          onClick={handleNext}
          disabled={safeCurrentPage === safeTotalPages}
          aria-label={labels.next}
          className={cn(
            paginationButtonVariants({
              variant,
              size,
              isDisabled: safeCurrentPage === safeTotalPages,
            }),
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        <span
          className="ml-4 text-gray-500 text-sm dark:text-gray-400"
          aria-live="polite"
        >
          {labels.page} {safeCurrentPage} {labels.of} {safeTotalPages}
        </span>
      </nav>
    );
  },
);

ReviewPagination.displayName = "ReviewPagination";
