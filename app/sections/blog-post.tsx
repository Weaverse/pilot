import { FacebookLogo, PinterestLogo, XLogo } from "@phosphor-icons/react";
import { useLoaderData, useRouteLoaderData } from "@remix-run/react";
import { type HydrogenComponentSchema, isBrowser } from "@weaverse/hydrogen";
import { forwardRef } from "react";
import {
  FacebookShareButton,
  PinterestShareButton,
  TwitterShareButton,
} from "react-share";
import type { ArticleQuery } from "storefront-api.generated";
import { Image } from "~/components/image";
import { Section, type SectionProps, layoutInputs } from "~/components/section";
import type { RootLoader } from "~/root";

interface BlogPostProps extends SectionProps {
  showTags: boolean;
  showShareButtons: boolean;
}

let BlogPost = forwardRef<HTMLElement, BlogPostProps>((props, ref) => {
  let { showTags, showShareButtons, ...rest } = props;
  let { layout } = useRouteLoaderData<RootLoader>("root");
  let { article, blog, formattedDate } = useLoaderData<{
    article: ArticleQuery["blog"]["articleByHandle"];
    blog: ArticleQuery["blog"];
    formattedDate: string;
  }>();
  let { title, handle, image, contentHtml, author, tags } = article;
  if (article) {
    let domain = layout.shop.primaryDomain.url;
    if (isBrowser) {
      let origin = window.location.origin;
      if (!origin.includes("localhost")) {
        domain = origin;
      }
    }
    let { handle: blogHandle } = blog;
    let articleUrl = `${domain}/blogs/${blogHandle}/${handle}`;
    return (
      <Section ref={ref} {...rest}>
        {image && (
          <div className="h-[520px]">
            <Image data={image} sizes="90vw" />
          </div>
        )}
        <div className="space-y-5 py-4 lg:py-16 text-center">
          <div className="text-body-subtle">{formattedDate}</div>
          <h1 className="h3 !leading-tight">{title}</h1>
          {author?.name && (
            <div className="font-medium uppercase">
              by <span>{author.name}</span>
            </div>
          )}
        </div>
        <div className="border-t border-line-subtle w-1/3 mx-auto" />
        <article className="prose lg:max-w-4xl mx-auto py-4 lg:py-10">
          <div className="mx-auto space-y-8 md:space-y-16">
            <div
              suppressHydrationWarning
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
            <div className="border-t border-line-subtle w-1/3 mx-auto" />
            <div className="flex flex-col md:flex-row items-center justify-between gap-2">
              {showTags && (
                <div>
                  <strong>Tags:</strong>
                  <span className="ml-2">{tags.join(", ")}</span>
                </div>
              )}
              {showShareButtons && (
                <div className="flex gap-2 items-center">
                  <strong>Share:</strong>
                  <FacebookShareButton url={articleUrl}>
                    <FacebookLogo size={24} />
                  </FacebookShareButton>
                  <PinterestShareButton url={articleUrl} media={image?.url}>
                    <PinterestLogo size={24} />
                  </PinterestShareButton>
                  <TwitterShareButton url={articleUrl} title={title}>
                    <XLogo size={24} />
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

export let schema: HydrogenComponentSchema = {
  type: "blog-post",
  title: "Blog post",
  limit: 1,
  enabledOn: {
    pages: ["ARTICLE"],
  },
  inspector: [
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
};
