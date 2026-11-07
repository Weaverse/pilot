import { gql } from "@shopify/hydrogen";
import type { Storefront } from "~/.server/storefront";
import { CACHE_DEFAULT } from "~/utils/cache";
import { unwrapStorefront } from "~/utils/storefront";

/**
 * Local port of classic Hydrogen's `getSitemapIndex` / `getSitemap` (removed in
 * Hydrogen 2026.10). Same queries, same XML byte for byte and same headers;
 * queries run through `storefront.graphql` with the cache classic used
 * implicitly (`CACHE_DEFAULT`). Options Pilot never passed (`types`,
 * `customChildSitemaps`, `getChangeFreq`) are not ported, and `articles` pages
 * are rendered by Pilot's own articles sitemap (see `routes/seo/sitemap-page`).
 */

const SITEMAP_INDEX_PREFIX = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;
const SITEMAP_INDEX_SUFFIX = `
</sitemapindex>`;
const SITEMAP_PREFIX = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">`;
const SITEMAP_SUFFIX = "</urlset>";
const SITEMAP_HEADERS = {
  "Content-Type": "application/xml",
  "Cache-Control": `max-age=${60 * 60 * 24}`,
};

/** Resource types, in the order classic listed them in the index. */
const SITEMAP_TYPES = [
  "products",
  "pages",
  "collections",
  "metaObjects",
  "articles",
  "blogs",
] as const;

export async function getSitemapIndex({
  storefront,
  request,
}: {
  storefront: Storefront;
  request: Request;
}) {
  let data = unwrapStorefront(
    await storefront.graphql(SITEMAP_INDEX_QUERY, { cache: CACHE_DEFAULT }),
  );
  let baseUrl = new URL(request.url).origin;
  let body =
    SITEMAP_INDEX_PREFIX +
    SITEMAP_TYPES.map((type) => {
      let resource = data[type];
      if (!resource) {
        throw new Error(
          `[h2:sitemap:error] No data found for type ${type}. Check types passed to \`getSitemapIndex\``,
        );
      }
      return getSitemapLinks(type, resource.pagesCount?.count ?? 0, baseUrl);
    }).join("\n") +
    SITEMAP_INDEX_SUFFIX;
  return new Response(body, { headers: SITEMAP_HEADERS });
}

type GetLinkArgs = {
  type: string;
  baseUrl: string;
  handle?: string;
  locale?: string;
};

type SitemapItem = { handle: string; updatedAt: string; type?: string };

export async function getSitemap({
  storefront,
  request,
  params,
  getLink,
  locales = [],
  noItemsFallback = "/",
}: {
  storefront: Storefront;
  request: Request;
  params: { type?: string; page?: string };
  /** Builds each resource URL (and its `hreflang` alternates when `locales` is set). */
  getLink: (args: GetLinkArgs) => string;
  /** `hreflang` values to emit `xhtml:link` alternates for. */
  locales?: string[];
  /** Path listed when the page has no items. */
  noItemsFallback?: string;
}) {
  if (!(params.type && params.page)) {
    throw new Response("No data found", { status: 404 });
  }
  let type = params.type;
  let items = await fetchSitemapItems(
    storefront,
    type,
    Number.parseInt(params.page, 10),
  );
  if (!items) {
    throw new Response("Not found", { status: 404 });
  }
  let baseUrl = new URL(request.url).origin;
  let body = "";
  if (items.length) {
    body =
      SITEMAP_PREFIX +
      items
        .map((item) =>
          renderUrlTag({
            url: getLink({
              type: item.type ?? type,
              baseUrl,
              handle: item.handle,
            }),
            type: item.type ?? type,
            getLink,
            updatedAt: item.updatedAt,
            handle: item.handle,
            locales,
            baseUrl,
          }),
        )
        .join("\n") +
      SITEMAP_SUFFIX;
  } else {
    body = `${SITEMAP_PREFIX}
  <url><loc>${baseUrl + noItemsFallback}</loc></url>
${SITEMAP_SUFFIX}`;
  }
  return new Response(body, { headers: SITEMAP_HEADERS });
}

/** The page's items, or `undefined` for an unknown resource type. */
async function fetchSitemapItems(
  storefront: Storefront,
  type: string,
  page: number,
): Promise<SitemapItem[] | undefined> {
  let options = { variables: { page }, cache: CACHE_DEFAULT };
  switch (type) {
    case "products":
      return (
        unwrapStorefront(
          await storefront.graphql(PRODUCT_SITEMAP_QUERY, options),
        ).sitemap.resources?.items ?? []
      );
    case "collections":
      return (
        unwrapStorefront(
          await storefront.graphql(COLLECTION_SITEMAP_QUERY, options),
        ).sitemap.resources?.items ?? []
      );
    case "pages":
      return (
        unwrapStorefront(await storefront.graphql(PAGE_SITEMAP_QUERY, options))
          .sitemap.resources?.items ?? []
      );
    case "blogs":
      return (
        unwrapStorefront(await storefront.graphql(BLOG_SITEMAP_QUERY, options))
          .sitemap.resources?.items ?? []
      );
    case "metaObjects":
      return (
        unwrapStorefront(
          await storefront.graphql(METAOBJECT_SITEMAP_QUERY, options),
        ).sitemap.resources?.items ?? []
      );
    default:
      return;
  }
}

function getSitemapLinks(resource: string, count: number, baseUrl: string) {
  let links = "";
  for (let i = 1; i <= count; i++) {
    links += `  <sitemap><loc>${baseUrl}/sitemap/${resource}/${i}.xml</loc></sitemap>
`;
  }
  return links;
}

function renderUrlTag({
  url,
  updatedAt,
  locales,
  type,
  getLink,
  baseUrl,
  handle,
}: {
  url: string;
  updatedAt: string;
  locales: string[];
  type: string;
  getLink: (args: GetLinkArgs) => string;
  baseUrl: string;
  handle: string;
}) {
  return `<url>
  <loc>${url}</loc>
  <lastmod>${updatedAt}</lastmod>
  <changefreq>weekly</changefreq>
${locales
  .map((locale) =>
    renderAlternateTag(getLink({ type, baseUrl, handle, locale }), locale),
  )
  .join("\n")}
</url>
  `.trim();
}

function renderAlternateTag(url: string, locale: string) {
  return `  <xhtml:link rel="alternate" hreflang="${locale}" href="${url}" />`;
}

const SITEMAP_INDEX_QUERY = gql(`
  query SitemapIndex {
    products: sitemap(type: PRODUCT) {
      pagesCount {
        count
      }
    }
    collections: sitemap(type: COLLECTION) {
      pagesCount {
        count
      }
    }
    articles: sitemap(type: ARTICLE) {
      pagesCount {
        count
      }
    }
    pages: sitemap(type: PAGE) {
      pagesCount {
        count
      }
    }
    blogs: sitemap(type: BLOG) {
      pagesCount {
        count
      }
    }
    metaObjects: sitemap(type: METAOBJECT) {
      pagesCount {
        count
      }
    }
  }
`);

const PRODUCT_SITEMAP_QUERY = gql(`
  query SitemapProducts($page: Int!) {
    sitemap(type: PRODUCT) {
      resources(page: $page) {
        items {
          handle
          updatedAt
        }
      }
    }
  }
`);

const COLLECTION_SITEMAP_QUERY = gql(`
  query SitemapCollections($page: Int!) {
    sitemap(type: COLLECTION) {
      resources(page: $page) {
        items {
          handle
          updatedAt
        }
      }
    }
  }
`);

const PAGE_SITEMAP_QUERY = gql(`
  query SitemapPages($page: Int!) {
    sitemap(type: PAGE) {
      resources(page: $page) {
        items {
          handle
          updatedAt
        }
      }
    }
  }
`);

const BLOG_SITEMAP_QUERY = gql(`
  query SitemapBlogs($page: Int!) {
    sitemap(type: BLOG) {
      resources(page: $page) {
        items {
          handle
          updatedAt
        }
      }
    }
  }
`);

const METAOBJECT_SITEMAP_QUERY = gql(`
  query SitemapMetaobjects($page: Int!) {
    sitemap(type: METAOBJECT) {
      resources(page: $page) {
        items {
          handle
          updatedAt
          ... on SitemapResourceMetaobject {
            type
          }
        }
      }
    }
  }
`);
