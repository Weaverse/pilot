import { Await, useLoaderData } from "@remix-run/react";
import type { HydrogenComponentSchema } from "@weaverse/hydrogen";
import { Suspense, forwardRef } from "react";
import { layoutInputs, Section, type SectionProps } from "~/components/section";
import { Skeleton } from "~/components/skeleton";
import { getImageLoadingPriority } from "~/utils/image";
import { ArticleCard, type ArticleCardProps } from "./blogs";
import type { ArticleFragment } from "storefront-api.generated";
import { Swimlane } from "~/components/swimlane";
import Heading from "~/components/heading";

interface RelatedArticlesProps
  extends Omit<ArticleCardProps, "article" | "blogHandle" | "loading">,
    SectionProps {
  heading: string;
}

let RelatedArticles = forwardRef<HTMLElement, RelatedArticlesProps>(
  (props, ref) => {
    let { blog, relatedArticles } = useLoaderData<{
      relatedArticles: ArticleFragment[];
      blog: { handle: string };
    }>();
    let {
      heading,
      showExcerpt,
      showAuthor,
      showDate,
      showReadmore,
      imageAspectRatio,
      ...rest
    } = props;
    if (relatedArticles.length > 0) {
      return (
        <Section ref={ref} {...rest}>
          <Heading content={heading} animate={false} />
          <Swimlane>
            {relatedArticles.map((article, i) => (
              <ArticleCard
                key={article.id}
                blogHandle={blog.handle}
                article={article}
                loading={getImageLoadingPriority(i, 2)}
                showAuthor={showAuthor}
                showExcerpt={showExcerpt}
                showDate={showDate}
                showReadmore={showReadmore}
                imageAspectRatio={imageAspectRatio}
                className="snap-start w-80"
              />
            ))}
          </Swimlane>
        </Section>
      );
    }
    return <section ref={ref} />;
  },
);

export default RelatedArticles;

export let schema: HydrogenComponentSchema = {
  type: "related-articles",
  title: "Related articles",
  limit: 1,
  enabledOn: {
    pages: ["ARTICLE"],
  },
  inspector: [
    {
      group: "Layout",
      inputs: layoutInputs,
    },
    {
      group: "Content",
      inputs: [
        {
          type: "text",
          name: "heading",
          label: "Heading",
          defaultValue: "Related articles",
          placeholder: "Related articles",
        },
        {
          type: "select",
          name: "imageAspectRatio",
          label: "Image aspect ratio",
          defaultValue: "adapt",
          configs: {
            options: [
              { value: "adapt", label: "Adapt to image" },
              { value: "1/1", label: "Square (1/1)" },
              { value: "3/4", label: "Portrait (3/4)" },
              { value: "4/3", label: "Landscape (4/3)" },
              { value: "16/9", label: "Widescreen (16/9)" },
            ],
          },
          helpText:
            'Learn more about image <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/aspect-ratio" target="_blank" rel="noopener noreferrer">aspect ratio</a> property.',
        },
        {
          type: "switch",
          name: "showExcerpt",
          label: "Show excerpt",
          defaultValue: false,
        },
        {
          type: "switch",
          name: "showDate",
          label: "Show date",
          defaultValue: false,
        },
        {
          type: "switch",
          name: "showAuthor",
          label: "Show author",
          defaultValue: false,
        },
        {
          type: "switch",
          name: "showReadmore",
          label: "Show read more",
          defaultValue: true,
        },
      ],
    },
  ],
};
