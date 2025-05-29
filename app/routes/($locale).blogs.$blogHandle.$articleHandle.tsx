import type { SeoConfig } from "@shopify/hydrogen";
import { getSeoMeta } from "@shopify/hydrogen";
import type { RouteLoaderArgs } from "@weaverse/hydrogen";
import type { MetaFunction } from "react-router";
import type { ArticleQuery } from "storefront-api.generated";
import invariant from "tiny-invariant";
import { routeHeaders } from "~/utils/cache";
import { redirectIfHandleIsLocalized } from "~/utils/redirect";
import { seoPayload } from "~/utils/seo.server";
import { WeaverseContent } from "~/weaverse";

export let headers = routeHeaders;

export async function loader(args: RouteLoaderArgs) {
  let { request, params, context } = args;
  let { storefront } = context.weaverse;
  let { language, country } = storefront.i18n;

  invariant(params.blogHandle, "Missing blog handle");
  invariant(params.articleHandle, "Missing article handle");

  let { blogHandle, articleHandle } = params;

  // Load blog data and weaverseData in parallel
  let [{ blog }, weaverseData] = await Promise.all([
    storefront.query<ArticleQuery>(ARTICLE_QUERY, {
      variables: {
        blogHandle,
        articleHandle,
        language,
      },
    }),
    context.weaverse.loadPage({
      type: "ARTICLE",
      handle: articleHandle,
    }),
  ]);

  if (!blog?.articleByHandle) {
    throw new Response(null, { status: 404 });
  }
  redirectIfHandleIsLocalized(
    request,
    {
      handle: articleHandle,
      data: blog.articleByHandle,
    },
    {
      handle: blogHandle,
      data: blog,
    },
  );

  let article = blog.articleByHandle;
  let relatedArticles = blog.articles.nodes.filter(
    (art) => art?.handle !== articleHandle,
  );

  let formattedDate = new Intl.DateTimeFormat(`${language}-${country}`, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(article?.publishedAt));

  let seo = seoPayload.article({ article, url: request.url });

  return {
    article,
    blog: {
      handle: blogHandle,
    },
    relatedArticles,
    formattedDate,
    seo,
    weaverseData,
  };
}

export let meta: MetaFunction<typeof loader> = ({ data }) => {
  return getSeoMeta(data?.seo as SeoConfig);
};

export default function Article() {
  return <WeaverseContent />;
}

const ARTICLE_QUERY = `#graphql
  query article(
    $language: LanguageCode
    $blogHandle: String!
    $articleHandle: String!
  ) @inContext(language: $language) {
    blog(handle: $blogHandle) {
      title
      handle
      articleByHandle(handle: $articleHandle) {
        title
        handle
        contentHtml
        publishedAt
        tags
        author: authorV2 {
          name
        }
        image {
          id
          altText
          url
          width
          height
        }
        seo {
          description
          title
        }
      }
      articles (first: 20) {
        nodes {
            ...Article
        }
      }
    }
  }
  fragment Article on Article {
    author: authorV2 {
      name
    }
    contentHtml
    excerpt
    excerptHtml
    handle
    id
    image {
      id
      altText
      url
      width
      height
    }
    publishedAt
    title
  }
` as const;
