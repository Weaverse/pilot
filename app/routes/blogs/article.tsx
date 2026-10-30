import { gql, type StorefrontApi } from "@shopify/hydrogen";
import type { RouteLoaderArgs } from "@weaverse/hydrogen/react-router";
import type { MetaArgs } from "react-router";
import invariant from "tiny-invariant";
import { redirectIfHandleIsLocalized } from "~/.server/redirect";
import { seoPayload } from "~/.server/seo";
import { CACHE_DEFAULT, routeHeaders } from "~/utils/cache";
import { resolveLocaleFromRequest } from "~/utils/locale";
import { seoMetaFromMatches } from "~/utils/seo";
import { unwrapStorefront } from "~/utils/storefront";
import { WeaverseContent } from "~/weaverse";

export const headers = routeHeaders;

export async function loader(args: RouteLoaderArgs) {
  const { request, params, context } = args;
  const { storefront } = context.weaverse;
  // The canonical market table owns the BCP-47 tag used for formatting. It is
  // read from the request rather than the client: this storefront comes from
  // `context.weaverse`, so its `i18n` is the public identity, and the shape of
  // that field is not something this route should depend on.
  const { hreflang } = resolveLocaleFromRequest(request);

  invariant(params.blogHandle, "Missing blog handle");
  invariant(params.articleHandle, "Missing article handle");

  const { blogHandle, articleHandle } = params;

  // Load blog data and weaverseData in parallel
  const [{ blog }, weaverseData] = await Promise.all([
    storefront
      .graphql(ARTICLE_QUERY, {
        // `$language` is left to Hydrogen, which fills it from the request
        // context — the Shopify provider enum. This client comes from
        // `context.weaverse`, whose `i18n` carries the market's public code
        // (Weaverse keys translations by it); bare `ZH` resolves to English.
        variables: { blogHandle, articleHandle },
        cache: CACHE_DEFAULT,
      })
      .then(unwrapStorefront),
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

  const article = blog.articleByHandle;
  const relatedArticles = blog.articles.nodes.filter(
    (art) => art?.handle !== articleHandle,
  );

  const formattedDate = new Intl.DateTimeFormat(hreflang, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(article?.publishedAt));

  const seo = seoPayload.article({ article, url: request.url });

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

export const meta = ({ matches }: MetaArgs<typeof loader>) => {
  return seoMetaFromMatches(matches);
};

export default function Article() {
  return <WeaverseContent />;
}

const ARTICLE_QUERY = gql(`
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
`);

export type ArticleQuery = StorefrontApi.ResultOf<typeof ARTICLE_QUERY>;
export type ArticleFragment = NonNullable<
  ArticleQuery["blog"]
>["articles"]["nodes"][number];
