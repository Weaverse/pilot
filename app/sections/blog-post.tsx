import { FacebookLogo, PinterestLogo } from "@phosphor-icons/react";
import { useLoaderData } from "@remix-run/react";
import { Image } from "@shopify/hydrogen";
import type { Article } from "@shopify/hydrogen/storefront-api-types";
import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from "@weaverse/hydrogen";
import { forwardRef } from "react";
import { Section, type SectionProps, layoutInputs } from "~/components/section";

interface BlogPostProps extends SectionProps {
  paddingTop: number;
  paddingBottom: number;
}

let BlogPost = forwardRef<HTMLElement, BlogPostProps>((props, ref) => {
  let { paddingTop, paddingBottom, ...rest } = props;
  let { article, formattedDate } = useLoaderData<{
    article: Article;
    formattedDate: string;
  }>();
  let { title, image, contentHtml, author, tags } = article;
  if (article) {
    return (
      <Section ref={ref} {...rest}>
        <div className="relative h-[520px]">
          {image && (
            <Image
              data={image}
              className="w-full absolute inset-0 z-0 object-cover h-full"
              sizes="90vw"
            />
          )}
        </div>
        <div className="space-y-5 w-full h-full flex items-center justify-end py-16 flex-col relative z-10 px-10 lg:px-20">
          <h5>{formattedDate}</h5>
          <h1 className="text-center">{title}</h1>
          <span className="uppercase">by {author?.name}</span>
        </div>
        <div className="border-t border-line/50 w-1/3 mx-auto" />
        <article className="prose max-w-screen-xl mx-auto py-10">
          <div className="px-4 mx-auto space-y-8 md:space-y-16">
            <div
              suppressHydrationWarning
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
            <div className="md:flex items-center justify-between gap-2">
              <div>
                <strong>Tags:</strong>
                <span className="ml-2">{tags.join(", ")}</span>
              </div>
              <div className="flex gap-4 items-center">
                <strong>Share:</strong>
                <PinterestLogo size={24} />
                <FacebookLogo size={24} />
              </div>
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
    { group: "Layout", inputs: layoutInputs },
    {
      group: "Blog post",
      inputs: [
        {
          type: "range",
          label: "Top padding",
          name: "paddingTop",
          configs: {
            min: 0,
            max: 100,
            step: 4,
            unit: "px",
          },
          defaultValue: 0,
        },
        {
          type: "range",
          label: "Bottom padding",
          name: "paddingBottom",
          configs: {
            min: 0,
            max: 100,
            step: 4,
            unit: "px",
          },
          defaultValue: 0,
        },
      ],
    },
  ],
};
