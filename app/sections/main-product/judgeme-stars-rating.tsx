import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useLoaderData } from "react-router";
import { Skeleton } from "~/components/skeleton";
import { StarRating } from "~/components/star-rating";
import { usePrefixPathWithLocale } from "~/hooks/use-prefix-path-with-locale";
import type { loader as productRouteLoader } from "~/routes/products/product";
import type { JudgemeStarsRatingData } from "~/types/judgeme";

interface JudgemeStarsRatingProps extends Partial<HydrogenComponentProps> {
  ref?: React.Ref<HTMLDivElement>;
  productHandle?: string;
  onClickEvent?: "do-nothing" | "scroll-to-section";
  sectionId?: string;
  ratingText?: string;
  noReviewsText?: string;
  errorText?: string;
}

function formatRatingText(text: string, rating: number, totalReviews: number) {
  return text
    .replace(/\{\{rating\}\}/g, rating.toFixed(1))
    .replace(/\{\{total_reviews\}\}/g, totalReviews.toString());
}

export default function JudgemeStarsRating(props: JudgemeStarsRatingProps) {
  const {
    ref,
    productHandle,
    onClickEvent = "do-nothing",
    sectionId,
    ratingText = "{{rating}}/5 - ({{total_reviews}} reviews)",
    noReviewsText = "No reviews",
    errorText = "Unable to load reviews",
    ...rest
  } = props;

  const [status, setStatus] = useState<"idle" | "loading" | "error" | "ok">(
    "idle",
  );
  const [data, setData] = useState<JudgemeStarsRatingData | null>(null);
  const { product } = useLoaderData<typeof productRouteLoader>();
  const handle = productHandle || product?.handle;
  const ratingAPI = usePrefixPathWithLocale(
    `/api/product/${handle}/reviews?type=rating`,
  );

  const { ref: inViewRef, inView } = useInView({ triggerOnce: true });

  const setRefs = (node: HTMLDivElement) => {
    if (ref && typeof ref === "object") {
      ref.current = node;
    } else if (typeof ref === "function") {
      ref(node);
    }
    inViewRef(node);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: only fetch when product handle change
  useEffect(() => {
    if (!(handle && inView)) {
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
      .then((d: JudgemeStarsRatingData | null) => {
        if (d) {
          setData(d);
          setStatus("ok");
        } else {
          setStatus("error");
          setData(null);
        }
      })
      .catch((err) => {
        console.error("Error fetching Judge.me stars rating data:", err);
        setStatus("error");
        setData(null);
      });
  }, [handle, inView]);

  if (!handle) {
    return null;
  }

  if (status === "idle" || status === "loading") {
    return (
      <div {...rest} ref={setRefs} className="flex">
        <div className="inline-flex items-center gap-1">
          <Skeleton className="h-4 w-20 rounded" />
          <Skeleton className="h-4 w-8 rounded" />
        </div>
      </div>
    );
  }

  if (status === "error" || !data) {
    return (
      <div {...rest} ref={ref}>
        <div className={clsx("text-gray-500", !errorText && "hidden")}>
          {errorText}
        </div>
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
}

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
          defaultValue: "scroll-to-section",
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
        {
          type: "text",
          name: "errorText",
          label: "Error text",
          defaultValue: "Unable to load reviews",
          placeholder: "Unable to load reviews",
          helpText: "Leave empty to hide error message.",
        },
      ],
    },
  ],
});
