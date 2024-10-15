import type { MetaFunction } from "@remix-run/react";
import type { SeoConfig } from "@shopify/hydrogen";
import { getSeoMeta } from "@shopify/hydrogen";
import { json } from "@shopify/remix-oxygen";
import type { RouteLoaderArgs } from "@weaverse/hydrogen";
import invariant from "tiny-invariant";
import type { ArticleDetailsQuery } from "storefrontapi.generated";
import { routeHeaders } from "~/data/cache";
import { ARTICLE_QUERY } from "~/data/queries";
import { seoPayload } from "~/lib/seo.server";
import { WeaverseContent } from "~/weaverse";

export let headers = routeHeaders;

export async function loader(args: RouteLoaderArgs) {
  let { request, params, context } = args;
  let { language, country } = context.storefront.i18n;

  invariant(params.blogHandle, "Missing blog handle");
  invariant(params.articleHandle, "Missing article handle");

  let { blog } = await context.storefront.query<ArticleDetailsQuery>(
    ARTICLE_QUERY,
    {
      variables: {
        blogHandle: params.blogHandle,
        articleHandle: params.articleHandle,
        language,
      },
    }
  );

  if (!blog?.articleByHandle) {
    throw new Response(null, { status: 404 });
  }

  let article = blog.articleByHandle;
  let relatedArticles = blog.articles.nodes.filter(
    (art) => art?.handle !== params?.articleHandle
  );

  let formattedDate = new Intl.DateTimeFormat(`${language}-${country}`, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(article?.publishedAt));

  let seo = seoPayload.article({ article, url: request.url });

  return json({
    article,
    blog: {
      handle: params.blogHandle,
    },
    relatedArticles,
    formattedDate,
    seo,
    weaverseData: await context.weaverse.loadPage({
      type: "ARTICLE",
      handle: params.articleHandle,
    }),
  });
}

export let meta: MetaFunction<typeof loader> = ({ data }) => {
  return getSeoMeta(data?.seo as SeoConfig);
};

export default function Article() {
  return <WeaverseContent />;
}
