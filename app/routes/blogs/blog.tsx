import { flattenConnection, gql, type StorefrontApi } from "@shopify/hydrogen";
import type { LoaderFunctionArgs, MetaArgs } from "react-router";
import { data } from "react-router";
import invariant from "tiny-invariant";
import { redirectIfHandleIsLocalized } from "~/.server/redirect";
import { seoPayload } from "~/.server/seo";
import { CACHE_DEFAULT, routeHeaders } from "~/utils/cache";
import { resolveLocaleFromRequest } from "~/utils/locale";
import { seoMetaFromMatches } from "~/utils/seo";
import { unwrapStorefront } from "~/utils/storefront";
import { WeaverseContent } from "~/weaverse";

export const headers = routeHeaders;

export const loader = async (args: LoaderFunctionArgs) => {
  const { params, request, context } = args;
  const storefront = context.storefront;
  // The canonical market table owns the BCP-47 tag; `storefront.i18n.language`
  // is the provider enum and can be script-specific (`ZH_CN`), which `Intl`
  // rejects.
  const { hreflang } = resolveLocaleFromRequest(request);
  const blogHandle = params?.blogHandle;

  invariant(blogHandle, "Missing blog handle");

  // Load blog data and weaverseData in parallel
  const [{ blog }, weaverseData] = await Promise.all([
    storefront
      .graphql(BLOGS_QUERY, {
        variables: { blogHandle, pageBy: 16 },
        cache: CACHE_DEFAULT,
      })
      .then(unwrapStorefront),
    context.weaverse.loadPage({ type: "BLOG", handle: blogHandle }),
  ]);

  if (!blog?.articles) {
    throw new Response("Not found", { status: 404 });
  }
  redirectIfHandleIsLocalized(request, {
    handle: blogHandle,
    data: blog,
  });

  const articles = flattenConnection(blog.articles).map((article) => {
    const { publishedAt } = article;
    return {
      ...article,
      publishedAt: new Intl.DateTimeFormat(hreflang, {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(publishedAt)),
    };
  });

  const seo = seoPayload.blog({ blog, url: request.url });

  return data({ blog, articles, seo, weaverseData });
};

export const meta = ({ matches }: MetaArgs<typeof loader>) => {
  return seoMetaFromMatches(matches);
};

export default function Blogs() {
  return <WeaverseContent />;
}

const BLOGS_QUERY = gql(`
  query blog(
    $language: LanguageCode
    $blogHandle: String!
    $pageBy: Int!
    $cursor: String
  ) @inContext(language: $language) {
    blog(handle: $blogHandle) {
      title
      handle
      seo {
        title
        description
      }
      articles(first: $pageBy, after: $cursor) {
        edges {
          node {
            ...Article
          }
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

export type BlogQuery = StorefrontApi.ResultOf<typeof BLOGS_QUERY>;
