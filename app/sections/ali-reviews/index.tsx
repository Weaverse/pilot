import type {
  ComponentLoaderArgs,
  HydrogenComponentSchema,
} from "@weaverse/hydrogen";
import { forwardRef } from "react";
import { backgroundInputs } from "~/components/BackgroundImage";
import type { SectionProps } from "~/components/Section";
import { Section, layoutInputs } from "~/components/Section";
import { type AliReview } from "./review-item";

type AliReviewsProps = SectionProps<Awaited<ReturnType<typeof loader>>>;

let AliReviewSection = forwardRef<HTMLElement, AliReviewsProps>(
  (props, ref) => {
    let { children, loaderData, ...rest } = props;
    return (
      <Section ref={ref} {...rest} overflow="unset">
        {children}
      </Section>
    );
  },
);

export type AliReviewsLoaderData = Awaited<ReturnType<typeof loader>>;

export let loader = async ({ weaverse }: ComponentLoaderArgs<{}, Env>) => {
  let res = await fetch(
    "https://widget-hub-api.alireviews.io/api/public/reviews",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${weaverse.env.ALI_REVIEWS_API_KEY}`,
        "Content-Type": "application/json",
      },
    },
  );
  let { data } = await res.json<{
    data: { reviews: AliReview[]; cursor: string };
    message: string;
    status: number;
  }>();
  return data.reviews;
};

export default AliReviewSection;

export let schema: HydrogenComponentSchema = {
  type: "ali-reviews",
  title: "Ali Reviews box",
  inspector: [
    {
      group: "Layout",
      inputs: layoutInputs.filter((inp) => inp.name !== "borderRadius"),
    },
    {
      group: "Background",
      inputs: backgroundInputs.filter((inp) => inp.name === "backgroundColor"),
    },
  ],
  childTypes: [
    "ali-reviews--list",
    "heading",
    "subheading",
    "paragraph",
    "button",
  ],
  toolbar: ["general-settings", ["duplicate", "delete"]],
  presets: {
    children: [
      { type: "heading", content: "Reviews" },
      {
        type: "paragraph",
        content:
          "This section demonstrates how to integrate with third-party apps using their public APIs. Reviews are fetched from Ali Reviews API.",
      },
      {
        type: "ali-reviews--list",
        showAvgRating: true,
        showReviewsCount: true,
        showReviewsProgressBar: true,
        reviewsToShow: 5,
        showReviewWithMediaOnly: true,
        showCountry: true,
        showDate: true,
        showVerifiedBadge: true,
        verifiedBadgeText: "Verified purchase",
        showStar: true,
      },
    ],
  },
};
