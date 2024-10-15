import type { MetaFunction } from "@remix-run/react";
import type { SeoConfig } from "@shopify/hydrogen";
import { flattenConnection, getSeoMeta } from "@shopify/hydrogen";
import { json } from "@shopify/remix-oxygen";
import type { RouteLoaderArgs } from "@weaverse/hydrogen";
import invariant from "tiny-invariant";
import type { BlogQuery } from "storefrontapi.generated";
import { routeHeaders } from "~/data/cache";
import { BLOGS_QUERY } from "~/data/queries";
import { PAGINATION_SIZE } from "~/lib/const";
import { seoPayload } from "~/lib/seo.server";
import { WeaverseContent } from "~/weaverse";

export const headers = routeHeaders;

export const loader = async (args: RouteLoaderArgs) => {
  let { params, request, context } = args;
  const { language, country } = context.storefront.i18n;

  invariant(params.blogHandle, "Missing blog handle");

  const { blog } = await context.storefront.query<BlogQuery>(BLOGS_QUERY, {
    variables: {
      blogHandle: params.blogHandle,
      pageBy: PAGINATION_SIZE,
      language,
    },
  });

  if (!blog?.articles) {
    throw new Response("Not found", { status: 404 });
  }

  const articles = flattenConnection(blog.articles).map((article) => {
    const { publishedAt } = article;
    return {
      ...article,
      publishedAt: new Intl.DateTimeFormat(`${language}-${country}`, {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(publishedAt)),
    };
  });

  const seo = seoPayload.blog({ blog, url: request.url });

  return json({
    blog,
    articles,
    seo,
    weaverseData: await context.weaverse.loadPage({
      type: "BLOG",
      handle: params.blogHandle,
    }),
  });
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return getSeoMeta(data?.seo as SeoConfig);
};

export default function Blogs() {
  return <WeaverseContent />;
}
