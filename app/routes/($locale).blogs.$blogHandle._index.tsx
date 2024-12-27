import type { MetaFunction } from "@remix-run/react";
import type { SeoConfig } from "@shopify/hydrogen";
import { flattenConnection, getSeoMeta } from "@shopify/hydrogen";
import { json } from "@shopify/remix-oxygen";
import type { RouteLoaderArgs, WeaverseClient } from "@weaverse/hydrogen";
import invariant from "tiny-invariant";
import type { BlogQuery } from "storefront-api.generated";
import { routeHeaders } from "~/utils/cache";
import { BLOGS_QUERY } from "~/graphql/queries";
import { PAGINATION_SIZE } from "~/utils/const";
import { seoPayload } from "~/utils/seo.server";
import { WeaverseContent } from "~/weaverse";

export const headers = routeHeaders;

export const loader = async (args: RouteLoaderArgs) => {
  let { params, request, context } = args;
  let storefront = context.storefront as WeaverseClient["storefront"];
  let { language, country } = storefront.i18n;

  invariant(params.blogHandle, "Missing blog handle");

  let { blog } = await storefront.query<BlogQuery>(BLOGS_QUERY, {
    variables: {
      blogHandle: params.blogHandle,
      pageBy: PAGINATION_SIZE,
      language,
    },
  });

  if (!blog?.articles) {
    throw new Response("Not found", { status: 404 });
  }

  let articles = flattenConnection(blog.articles).map((article) => {
    let { publishedAt } = article;
    return {
      ...article,
      publishedAt: new Intl.DateTimeFormat(`${language}-${country}`, {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(publishedAt)),
    };
  });

  let seo = seoPayload.blog({ blog, url: request.url });

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

export let meta: MetaFunction<typeof loader> = ({ data }) => {
  return getSeoMeta(data?.seo as SeoConfig);
};

export default function Blogs() {
  return <WeaverseContent />;
}
