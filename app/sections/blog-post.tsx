import {
  FacebookLogoIcon,
  PinterestLogoIcon,
  XLogoIcon,
} from "@phosphor-icons/react";
import { createSchema, isBrowser } from "@weaverse/hydrogen";
import { forwardRef } from "react";
import { useLoaderData, useRouteLoaderData } from "react-router";
import {
  FacebookShareButton,
  PinterestShareButton,
  TwitterShareButton,
} from "react-share";
import type { ArticleQuery } from "storefront-api.generated";
import { Image } from "~/components/image";
import { layoutInputs, Section, type SectionProps } from "~/components/section";
import type { RootLoader } from "~/root";

interface BlogPostProps extends SectionProps {
  showTags: boolean;
  showShareButtons: boolean;
}

const BlogPost = forwardRef<HTMLElement, BlogPostProps>((props, ref) => {
  const { showTags, showShareButtons, ...rest } = props;
  const { layout } = useRouteLoaderData<RootLoader>("root");
  const { article, blog, formattedDate } = useLoaderData<{
    article: ArticleQuery["blog"]["articleByHandle"];
    blog: ArticleQuery["blog"];
    formattedDate: string;
  }>();
  const { title, handle, image, contentHtml, author, tags } = article;
  if (article) {
    let domain = layout.shop.primaryDomain.url;
    if (isBrowser) {
      const origin = window.location.origin;
      if (!origin.includes("localhost")) {
        domain = origin;
      }
    }
    const { handle: blogHandle } = blog;
    const articleUrl = `${domain}/blogs/${blogHandle}/${handle}`;
    return (
      <Section ref={ref} {...rest}>
        {image && (
          <div className="h-[520px]">
            <Image data={image} sizes="90vw" />
          </div>
        )}
        <div className="space-y-5 py-4 text-center lg:py-16">
          <div className="text-body-subtle">{formattedDate}</div>
          <h1 className="h3 leading-tight!">{title}</h1>
          {author?.name && (
            <div className="font-medium uppercase">
              by <span>{author.name}</span>
            </div>
          )}
        </div>
        <div className="mx-auto w-1/3 border-line-subtle border-t" />
        <article className="prose mx-auto py-4 lg:max-w-4xl lg:py-10">
          <div className="mx-auto space-y-8 md:space-y-16">
            <div
              suppressHydrationWarning
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
            <div className="mx-auto w-1/3 border-line-subtle border-t" />
            <div className="flex flex-col items-center justify-between gap-2 md:flex-row">
              {showTags && (
                <div>
                  <strong>Tags:</strong>
                  <span className="ml-2">{tags.join(", ")}</span>
                </div>
              )}
              {showShareButtons && (
                <div className="flex items-center gap-2">
                  <strong>Share:</strong>
                  <FacebookShareButton url={articleUrl}>
                    <FacebookLogoIcon size={24} />
                  </FacebookShareButton>
                  <PinterestShareButton url={articleUrl} media={image?.url}>
                    <PinterestLogoIcon size={24} />
                  </PinterestShareButton>
                  <TwitterShareButton url={articleUrl} title={title}>
                    <XLogoIcon size={24} />
                  </TwitterShareButton>
                </div>
              )}
            </div>
          </div>
        </article>
      </Section>
    );
  }
  return <Section ref={ref} {...rest} />;
});

export default BlogPost;

export const schema = createSchema({
  type: "blog-post",
  title: "Blog post",
  limit: 1,
  enabledOn: {
    pages: ["ARTICLE"],
  },
  settings: [
    {
      group: "Layout",
      inputs: layoutInputs.filter((input) => input.name !== "borderRadius"),
    },
    {
      group: "Article",
      inputs: [
        {
          type: "switch",
          label: "Show tags",
          name: "showTags",
          defaultValue: true,
        },
        {
          type: "switch",
          label: "Show share buttons",
          name: "showShareButtons",
          defaultValue: true,
        },
      ],
    },
  ],
});
