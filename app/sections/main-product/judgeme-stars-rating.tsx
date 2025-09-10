import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";
import { forwardRef, useEffect, useState, useCallback } from "react";
import { useLoaderData } from "react-router";
import { StarRating } from "~/components/star-rating";
import { usePrefixPathWithLocale } from "~/hooks/use-prefix-path-with-locale";
import type { loader as productRouteLoader } from "~/routes/($locale).products.$productHandle";
import type { JudgemeStarsRatingApiResponse, JudgemeStarsRatingData } from "~/types/judgeme";

interface JudgemeStarsRatingProps extends HydrogenComponentProps {
  onClickEvent?: "do-nothing" | "scroll-to-section";
  sectionId?: string;
}

const JudgemeStarsRating = forwardRef<HTMLDivElement, JudgemeStarsRatingProps>(
  (props, ref) => {
    const { onClickEvent = "do-nothing", sectionId, ...rest } = props;
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<JudgemeStarsRatingData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { product } = useLoaderData<typeof productRouteLoader>();
    const handle = product?.handle;
    const api = usePrefixPathWithLocale(`/api/review/${handle}?type=badge`);

    const handleClick = useCallback(() => {
      if (onClickEvent === "scroll-to-section" && sectionId) {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }
    }, [onClickEvent, sectionId]);

    useEffect(() => {
      if (!handle) {
        return;
      }

      setIsLoading(true);
      fetch(api)
        .then((res) => {
          if (res.ok) {
            return res.json();
          }
          throw new Error("Response not ok");
        })
        .then((response: JudgemeStarsRatingApiResponse) => {
          if (response.ok) {
            setData(response.data);
          } else {
            const errorResponse = response as { ok: false; error: string };
            setError(errorResponse.error);
          }
        })
        .catch((error) => {
          console.error("Error fetching Judge.me stars rating data:", error);
          setError("Failed to fetch Judge.me stars rating data");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }, [handle, api]);

    if (!handle) {
      return null;
    }

    if (isLoading || !data) {
      return (
        <div {...rest} ref={ref} onClick={onClickEvent !== "do-nothing" ? handleClick : undefined} className={onClickEvent !== "do-nothing" ? "cursor-pointer" : ""}>
          <div className="space-x-2">
            <div className="inline-flex items-center gap-1">
              <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-8 animate-pulse rounded bg-gray-200" />
            </div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div {...rest} ref={ref} onClick={onClickEvent !== "do-nothing" ? handleClick : undefined} className={onClickEvent !== "do-nothing" ? "cursor-pointer" : ""}>
          <div className="text-gray-500">
            Unable to load reviews
          </div>
        </div>
      );
    }

    return (
      <div {...rest} ref={ref} onClick={onClickEvent !== "do-nothing" ? handleClick : undefined} className={onClickEvent !== "do-nothing" ? "cursor-pointer" : ""}>
        <div className="flex items-center gap-2">
          <StarRating rating={data?.averageRating} />
          <span className="leading-4">({data?.totalReviews ? data.totalReviews : 'No reviews'})</span>
        </div>
      </div>
    );
  },
);

export default JudgemeStarsRating;

export const schema = createSchema({
  type: "judgeme-stars-rating",
  title: "Stars rating",
  settings: [
    {
      group: "General",
      inputs: [
        {
          type: "select",
          name: "onClickEvent",
          label: "On click event",
          defaultValue: "do-nothing",
          configs: {
            options: [
              { value: "do-nothing", label: "Do nothing" },
              { value: "scroll-to-section", label: "Scroll to reviews section" },
            ],
          },
        },
        {
          type: "text",
          name: "sectionId",
          label: "Section ID to scroll to",
          placeholder: "Enter section ID",
          condition: {
            type: "select",
            name: "onClickEvent",
            value: "scroll-to-section",
          },
        },
      ],
    },
  ],
});
