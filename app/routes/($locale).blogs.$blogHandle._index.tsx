import type { MetaFunction } from "@remix-run/react";
import type { SeoConfig } from "@shopify/hydrogen";
import { flattenConnection, getSeoMeta } from "@shopify/hydrogen";
import { json, type LoaderFunctionArgs } from "@shopify/remix-oxygen";
import invariant from "tiny-invariant";
import type { BlogQuery } from "storefront-api.generated";
import { routeHeaders } from "~/utils/cache";
import { PAGINATION_SIZE } from "~/utils/const";
import { seoPayload } from "~/utils/seo.server";
import { WeaverseContent } from "~/weaverse";

export let headers = routeHeaders;

export let loader = async (args: LoaderFunctionArgs) => {
  let { params, request, context } = args;
  let storefront = context.storefront;
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
