import { useLoaderData } from "@remix-run/react";
import type { HydrogenComponentSchema } from "@weaverse/hydrogen";
import { forwardRef } from "react";
import type { ArticleFragment, BlogQuery } from "storefront-api.generated";
import { Image } from "~/components/image";
import { Link } from "~/components/link";
import { Section, type SectionProps, layoutInputs } from "~/components/section";
import { RevealUnderline } from "~/reveal-underline";
import type { ImageAspectRatio } from "~/types/image";
import { cn } from "~/utils/cn";
import { getImageAspectRatio, getImageLoadingPriority } from "~/utils/image";

interface BlogsProps
  extends Omit<ArticleCardProps, "article" | "blogHandle" | "loading">,
    SectionProps {
  layout: "blog" | "default";
}

let Blogs = forwardRef<HTMLElement, BlogsProps>((props, ref) => {
  let {
    layout,
    showExcerpt,
    showAuthor,
    showDate,
    showReadmore,
    imageAspectRatio,
    ...rest
  } = props;
  let { blog, articles } = useLoaderData<
    BlogQuery & { articles: ArticleFragment[] }
  >();

  if (blog) {
    return (
      <Section ref={ref} {...rest}>
        <h4 className="text-center font-medium">{blog.title}</h4>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-4 gap-y-12">
          {articles.map((article, i) => (
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
            />
          ))}
        </div>
      </Section>
    );
  }
  return <Section ref={ref} {...rest} />;
});

export interface ArticleCardProps {
  article: ArticleFragment;
  blogHandle: string;
  loading?: HTMLImageElement["loading"];
  showDate: boolean;
  showExcerpt: boolean;
  showAuthor: boolean;
  showReadmore: boolean;
  imageAspectRatio: ImageAspectRatio;
  className?: string;
}

export function ArticleCard({
  blogHandle,
  article,
  loading,
  showExcerpt,
  showAuthor,
  showDate,
  showReadmore,
  imageAspectRatio,
  className,
}: ArticleCardProps) {
  return (
    <div className={cn("flex flex-col gap-5", className)}>
      {article.image && (
        <Link
          to={`/blogs/${blogHandle}/${article.handle}`}
          className="flex flex-col gap-5"
        >
          <Image
            alt={article.image.altText || article.title}
            data={article.image}
            aspectRatio={getImageAspectRatio(article.image, imageAspectRatio)}
            loading={loading}
            sizes="(min-width: 768px) 50vw, 100vw"
          />
        </Link>
      )}
      <div className="space-y-2.5">
        <Link
          to={`/blogs/${blogHandle}/${article.handle}`}
          className="text-xl leading-relaxed inline"
        >
          <RevealUnderline>{article.title}</RevealUnderline>
        </Link>
        <div className="flex items-center gap-2 empty:hidden text-gray-600">
          {showDate && <span className="block">{article.publishedAt}</span>}
          {showDate && showAuthor && <span>•</span>}
          {showAuthor && <span className="block">{article.author?.name}</span>}
        </div>
        {showExcerpt && (
          <div className="line-clamp-2 lg:line-clamp-4">{article.excerpt}</div>
        )}
        {showReadmore && (
          <div>
            <Link
              to={`/blogs/${blogHandle}/${article.handle}`}
              variant="underline"
            >
              Read more →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default Blogs;

export let schema: HydrogenComponentSchema = {
  type: "blogs",
  title: "Blogs",
  limit: 1,
  enabledOn: {
    pages: ["BLOG"],
  },
  inspector: [
    { group: "Layout", inputs: layoutInputs },
    {
      group: "Article card",
      inputs: [
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
          defaultValue: true,
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
