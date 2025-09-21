import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";
import { forwardRef, useEffect, useState } from "react";
import { useLoaderData } from "react-router";
import { StarRating } from "~/components/star-rating";
import { usePrefixPathWithLocale } from "~/hooks/use-prefix-path-with-locale";
import type { loader as productRouteLoader } from "~/routes/($locale).products.$productHandle";
import type { JudgemeStarsRatingData } from "~/types/judgeme";

interface JudgemeStarsRatingProps extends HydrogenComponentProps {
  onClickEvent?: "do-nothing" | "scroll-to-section";
  sectionId?: string;
  ratingText?: string;
  noReviewsText?: string;
}

function formatRatingText(text: string, rating: number, totalReviews: number) {
  return text
    .replace(/\{\{rating\}\}/g, rating.toFixed(1))
    .replace(/\{\{total_reviews\}\}/g, totalReviews.toString());
}

const JudgemeStarsRating = forwardRef<HTMLDivElement, JudgemeStarsRatingProps>(
  (props, ref) => {
    const {
      onClickEvent = "do-nothing",
      sectionId,
      ratingText = "{{rating}}/5 - ({{total_reviews}} reviews)",
      noReviewsText = "No reviews",
      ...rest
    } = props;
    const [status, setStatus] = useState<"idle" | "loading" | "error" | "ok">(
      "idle",
    );
    const [data, setData] = useState<JudgemeStarsRatingData | null>(null);
    const { product } = useLoaderData<typeof productRouteLoader>();
    const handle = product?.handle;
    const ratingAPI = usePrefixPathWithLocale(
      `/api/product/${handle}/reviews?type=rating`,
    );

    // biome-ignore lint/correctness/useExhaustiveDependencies: only fetch when product handle change
    useEffect(() => {
      if (!handle) {
        return;
      }

      setStatus("loading");
      fetch(ratingAPI)
        .then((res) => {
          if (res.ok) {
            return res.json();
          }
          throw new Error("Response not ok");
        })
        .then((d: JudgemeStarsRatingData) => {
          setData(d);
          setStatus("ok");
        })
        .catch((err) => {
          console.error("Error fetching Judge.me stars rating data:", err);
          setStatus("error");
        });
    }, [handle]);

    if (!handle) {
      return null;
    }

    if (status === "idle" || status === "loading") {
      return (
        <div {...rest} ref={ref}>
          <div className="space-x-2">
            <div className="inline-flex items-center gap-1">
              <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-8 animate-pulse rounded bg-gray-200" />
            </div>
          </div>
        </div>
      );
    }

    if (status === "error" || !data) {
      return (
        <div {...rest} ref={ref}>
          <div className="text-gray-500">Unable to load reviews</div>
        </div>
      );
    }

    return (
      <div
        {...rest}
        ref={ref}
        onClick={
          onClickEvent !== "do-nothing"
            ? () => {
                if (onClickEvent === "scroll-to-section" && sectionId) {
                  const element = document.getElementById(sectionId);
                  if (element) {
                    element.scrollIntoView({ behavior: "smooth" });
                  }
                }
              }
            : undefined
        }
        className={onClickEvent !== "do-nothing" ? "cursor-pointer" : ""}
      >
        <div className="flex items-center gap-2">
          <StarRating rating={data?.averageRating} />
          <span className="leading-4">
            {data?.totalReviews > 0
              ? formatRatingText(
                  ratingText,
                  data.averageRating,
                  data.totalReviews,
                )
              : noReviewsText}
          </span>
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
              {
                value: "scroll-to-section",
                label: "Scroll to reviews section",
              },
            ],
          },
        },
        {
          type: "text",
          name: "sectionId",
          label: "Section ID to scroll to",
          defaultValue: "judgeme-reviews-widget",
          placeholder: "judgeme-reviews-widget",
          condition: (data: JudgemeStarsRatingProps) =>
            data.onClickEvent === "scroll-to-section",
        },
        {
          type: "text",
          name: "ratingText",
          label: "Rating text format",
          defaultValue: "{{rating}}/5 ({{total_reviews}} reviews)",
          placeholder: "{{rating}}/5 ({{total_reviews}} reviews)",
          helpText:
            "Use <strong>{{rating}}</strong> for average rating and <strong>{{total_reviews}}</strong> for total review count.",
        },
        {
          type: "text",
          name: "noReviewsText",
          label: "No reviews text",
          defaultValue: "No reviews",
          placeholder: "No reviews",
        },
      ],
    },
  ],
});
