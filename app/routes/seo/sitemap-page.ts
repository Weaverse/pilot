import { getSitemap } from "@shopify/hydrogen";
import type { LoaderFunctionArgs } from "react-router";
import { DEFAULT_LOCALE } from "~/utils/locale";

// Match Shopify's sitemap pagination size so page numbers in the sitemap
// index (`sitemap/articles/1.xml`, `.../2.xml`, ...) stay consistent.
const ARTICLES_PER_SITEMAP_PAGE = 250;

const BLOGS_QUERY = `#graphql
  query SitemapBlogs($first: Int!, $after: String) {
    blogs(first: $first, after: $after) {
      nodes {
        handle
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
` as const;

const BLOG_ARTICLES_QUERY = `#graphql
  query SitemapBlogArticles(
    $blogHandle: String!
    $first: Int!
    $after: String
  ) {
    blog(handle: $blogHandle) {
      articles(first: $first, after: $after, sortKey: PUBLISHED_AT, reverse: true) {
        nodes {
          handle
          publishedAt
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
` as const;

type ArticleSitemapNode = {
  handle: string;
  publishedAt: string;
  blogHandle: string;
};

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Hydrogen's built-in `getSitemap` builds article links as
 * `/articles/<handle>`, but this storefront serves articles at
 * `/blogs/<blogHandle>/<articleHandle>` — so every built-in article URL
 * 404s. The built-in sitemap query only returns the article handle (no
 * parent blog), so articles need this custom query/renderer instead.
 */
async function articlesSitemap({
  request,
  params,
  storefront,
}: {
  request: Request;
  params: LoaderFunctionArgs["params"];
  storefront: LoaderFunctionArgs["context"]["storefront"];
}) {
  const page = Number(params.page);
  if (!Number.isInteger(page) || page < 1) {
    throw new Response("Not found", { status: 404 });
  }

  const baseUrl = new URL(request.url).origin;
  const endIndex = page * ARTICLES_PER_SITEMAP_PAGE;
  const nodes: ArticleSitemapNode[] = [];
  const blogHandles: string[] = [];
  let blogsAfter: string | null = null;

  // Storefront API has no root `articles` connection. Fetch all blog
  // handles first, then paginate each blog's articles so the canonical
  // parent blog handle is available for every URL.
  while (true) {
    const data: {
      blogs: {
        nodes: Array<{ handle: string }>;
        pageInfo: { hasNextPage: boolean; endCursor: string | null };
      };
    } = await storefront.query(BLOGS_QUERY, {
      variables: { first: 250, after: blogsAfter },
    });
    blogHandles.push(...data.blogs.nodes.map((blog) => blog.handle));
    if (!data.blogs.pageInfo.hasNextPage) {
      break;
    }
    blogsAfter = data.blogs.pageInfo.endCursor;
  }

  for (const blogHandle of blogHandles) {
    let articlesAfter: string | null = null;
    while (nodes.length < endIndex) {
      const data: {
        blog: {
          articles: {
            nodes: Array<{ handle: string; publishedAt: string }>;
            pageInfo: { hasNextPage: boolean; endCursor: string | null };
          };
        } | null;
      } = await storefront.query(BLOG_ARTICLES_QUERY, {
        variables: {
          blogHandle,
          first: ARTICLES_PER_SITEMAP_PAGE,
          after: articlesAfter,
        },
      });
      if (!data.blog) {
        break;
      }
      nodes.push(
        ...data.blog.articles.nodes.map((article) => ({
          ...article,
          blogHandle,
        })),
      );
      if (!data.blog.articles.pageInfo.hasNextPage) {
        break;
      }
      articlesAfter = data.blog.articles.pageInfo.endCursor;
    }
    if (nodes.length >= endIndex) {
      break;
    }
  }

  const pageNodes = nodes.slice(endIndex - ARTICLES_PER_SITEMAP_PAGE, endIndex);
  if (pageNodes.length === 0) {
    throw new Response("Not found", { status: 404 });
  }

  const urls = pageNodes
    .filter((node) => node.handle && node.blogHandle)
    .map((node) => {
      const canonicalPath = `/blogs/${node.blogHandle}/${node.handle}`;
      const loc = escapeXml(`${baseUrl}${canonicalPath}`);
      // No `xhtml:link` alternates: an article handle is localized per market
      // and an article may be unpublished in one, so swapping the prefix would
      // advertise URLs that redirect or 404. See `isMarketInvariantPath`.
      return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${escapeXml(node.publishedAt)}</lastmod>\n    <changefreq>weekly</changefreq>\n  </url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": `max-age=${60 * 60 * 24}`,
    },
  });
}

export async function loader({
  request,
  params,
  context: { storefront },
}: LoaderFunctionArgs) {
  if (params.type === "articles") {
    return articlesSitemap({ request, params, storefront });
  }

  const response = await getSitemap({
    storefront,
    request,
    params,
    // Only the default market is listed. Passing every locale makes Hydrogen
    // emit `hreflang` alternates by swapping the prefix onto one handle, but a
    // handle is per-market data — Shopify localizes it, and a resource can be
    // unpublished in a market — so those URLs may redirect or 404. A missing
    // alternate costs discovery in that market; a wrong one tells search
    // engines a page exists where it does not.
    locales: [DEFAULT_LOCALE.hreflang],
    getLink: ({ baseUrl, handle, type }) => `${baseUrl}/${type}/${handle}`,
  });

  response.headers.set("Cache-Control", `max-age=${60 * 60 * 24}`);

  return response;
}
