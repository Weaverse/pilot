import type { SeoConfig } from "@shopify/hydrogen";
import { flattenConnection, getSeoMeta } from "@shopify/hydrogen";
import { data, type LoaderFunctionArgs } from "@shopify/remix-oxygen";
import type { MetaFunction } from "react-router";
import type { BlogQuery } from "storefront-api.generated";
import invariant from "tiny-invariant";
import { routeHeaders } from "~/utils/cache";
import { PAGINATION_SIZE } from "~/utils/const";
import { redirectIfHandleIsLocalized } from "~/utils/redirect";
import { seoPayload } from "~/utils/seo.server";
import { WeaverseContent } from "~/weaverse";

export const headers = routeHeaders;

export const loader = async (args: LoaderFunctionArgs) => {
  const { params, request, context } = args;
  const storefront = context.storefront;
  const { language, country } = storefront.i18n;

  invariant(params.blogHandle, "Missing blog handle");

  // Load blog data and weaverseData in parallel
  const [{ blog }, weaverseData] = await Promise.all([
    storefront.query<BlogQuery>(BLOGS_QUERY, {
      variables: {
        blogHandle: params.blogHandle,
        pageBy: PAGINATION_SIZE,
        language,
      },
    }),
    context.weaverse.loadPage({
      type: "BLOG",
      handle: params.blogHandle,
    }),
  ]);

  if (!blog?.articles) {
    throw new Response("Not found", { status: 404 });
  }
  redirectIfHandleIsLocalized(request, {
    handle: params.blogHandle,
    data: blog,
  });

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

  return data({
    blog,
    articles,
    seo,
    weaverseData,
  });
};

export const meta: MetaFunction<typeof loader> = ({ data: loaderData }) => {
  return getSeoMeta(loaderData?.seo as SeoConfig);
};

export default function Blogs() {
  return <WeaverseContent />;
}

const BLOGS_QUERY = `#graphql
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
` as const;
