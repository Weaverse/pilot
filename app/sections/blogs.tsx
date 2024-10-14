import { useLoaderData } from "@remix-run/react";
import { Image } from "@shopify/hydrogen";
import type { HydrogenComponentSchema } from "@weaverse/hydrogen";
import { forwardRef } from "react";
import type { ArticleFragment, BlogQuery } from "storefrontapi.generated";
import { Link } from "~/components/link";
import { Section, type SectionProps, layoutInputs } from "~/components/section";
import { getImageLoadingPriority } from "~/lib/const";

interface BlogsProps extends SectionProps {
  layout: "blog" | "default";
  paddingTop: number;
  paddingBottom: number;
  showExcerpt: boolean;
  showReadmore: boolean;
  showDate: boolean;
  showAuthor: boolean;
  imageAspectRatio: string;
}

let Blogs = forwardRef<HTMLElement, BlogsProps>((props, ref) => {
  let {
    layout,
    paddingTop,
    paddingBottom,
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
        <h3 className="text-center pt-2 md:pt-0 pb-4 md:pb-16">{blog.title}</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

function ArticleCard({
  blogHandle,
  article,
  loading,
  showExcerpt,
  showAuthor,
  showDate,
  showReadmore,
  imageAspectRatio,
}: {
  blogHandle: string;
  article: ArticleFragment;
  loading?: HTMLImageElement["loading"];
  showDate: boolean;
  showExcerpt: boolean;
  showAuthor: boolean;
  showReadmore: boolean;
  imageAspectRatio: string;
}) {
  return (
    <Link to={`/blogs/${blogHandle}/${article.handle}`}>
      {article.image && (
        <div className="card-image aspect-[3/2]">
          <Image
            alt={article.image.altText || article.title}
            className="object-cover w-full"
            data={article.image}
            aspectRatio={imageAspectRatio}
            loading={loading}
            sizes="(min-width: 768px) 50vw, 100vw"
          />
        </div>
      )}
      <div className="space-y-2.5">
        <h6 className="mt-4 font-medium text-2xl">{article.title}</h6>
        <div className="flex items-center space-x-1">
          {showDate && <span className="block">{article.publishedAt}</span>}
          {showDate && showAuthor && <span>•</span>}
          {showAuthor && <span className="block">{article.author?.name}</span>}
        </div>
        {showExcerpt && <div> {article.excerpt}</div>}
        {showReadmore && (
          <div>
            <span className="underline underline-offset-4">Read more</span>
          </div>
        )}
      </div>
    </Link>
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
          label: "Image aspect ratio",
          name: "imageAspectRatio",
          configs: {
            options: [
              { value: "auto", label: "Adapt to image" },
              { value: "1/1", label: "1/1" },
              { value: "3/2", label: "3/2" },
              { value: "3/4", label: "3/4" },
              { value: "4/3", label: "4/3" },
            ],
          },
          defaultValue: "3/2",
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
