import { createSchema } from "@weaverse/hydrogen";
import { forwardRef } from "react";
import { useLoaderData } from "react-router";
import type { ArticleFragment } from "storefront-api.generated";
import Heading from "~/components/heading";
import { layoutInputs, Section, type SectionProps } from "~/components/section";
import { Swimlane } from "~/components/swimlane";
import { getImageLoadingPriority } from "~/utils/image";
import { ArticleCard, type ArticleCardProps } from "./blogs";

interface RelatedArticlesProps
  extends Omit<ArticleCardProps, "article" | "blogHandle" | "loading">,
    SectionProps {
  heading: string;
}

const RelatedArticles = forwardRef<HTMLElement, RelatedArticlesProps>(
  (props, ref) => {
    const { blog, relatedArticles } = useLoaderData<{
      relatedArticles: ArticleFragment[];
      blog: { handle: string };
    }>();
    const {
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
                className="w-80 snap-start"
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

export const schema = createSchema({
  type: "related-articles",
  title: "Related articles",
  limit: 1,
  enabledOn: {
    pages: ["ARTICLE"],
  },
  settings: [
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
});
