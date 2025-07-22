import { type ComponentLoaderArgs, createSchema } from "@weaverse/hydrogen";
import { forwardRef } from "react";
import { backgroundInputs } from "~/components/background-image";
import type { SectionProps } from "~/components/section";
import { layoutInputs, Section } from "~/components/section";
import type { AliReview } from "./review-item";

type AliReviewsData = {
  aliReviewsApiKey: string;
};

type AliReviewsProps = SectionProps<Awaited<ReturnType<typeof loader>>> &
  AliReviewsData;

const AliReviewSection = forwardRef<HTMLElement, AliReviewsProps>(
  (props, ref) => {
    const { children, loaderData, aliReviewsApiKey, ...rest } = props;
    return (
      <Section ref={ref} {...rest} overflow="unset">
        {children}
      </Section>
    );
  },
);

export type AliReviewsLoaderData = Awaited<ReturnType<typeof loader>>;
type AliReviewsAPIPayload = {
  data: { reviews: AliReview[]; cursor: string };
  message: string;
  status: number;
};

export const loader = async ({
  data: { aliReviewsApiKey = "" },
  weaverse,
}: ComponentLoaderArgs<AliReviewsData>) => {
  const res = await weaverse
    .fetchWithCache<AliReviewsAPIPayload>(
      "https://widget-hub-api.alireviews.io/api/public/reviews",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${aliReviewsApiKey}`,
          "Content-Type": "application/json",
        },
      },
    )
    .catch((_err) => {
      return { data: { reviews: [], cursor: "" }, message: "", status: 0 };
    });
  return res?.data?.reviews;
};

export default AliReviewSection;

export const schema = createSchema({
  type: "ali-reviews",
  title: "Ali Reviews box",
  settings: [
    {
      group: "Integration",
      inputs: [
        {
          type: "text",
          name: "aliReviewsApiKey",
          label: "Ali Reviews API key",
          defaultValue: "",
          placeholder: "Your Ali Reviews API key",
          helpText: `Learn how to get your API key from <a href="https://support.fireapps.io/en/article/ali-reviews-learn-more-about-integration-using-api-key-hklfr0/" target="_blank">Ali Reviews app</a>.`,
          shouldRevalidate: true,
        },
      ],
    },
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
  presets: {
    children: [
      { type: "heading", content: "Reviews" },
      {
        type: "paragraph",
        content:
          "This section demonstrates how to integrate with third-party apps using their public APIs. Reviews are fetched from Ali Reviews API on the server side.",
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
});
