import { type LoaderFunctionArgs, redirect } from "react-router";

const ARTICLE_BLOG_LOOKUP_QUERY = `#graphql
  query ArticleBlogLookup($handle: String!, $after: String) {
    blogs(first: 50, after: $after) {
      nodes {
        handle
        articleByHandle(handle: $handle) {
          handle
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
` as const;

/**
 * Permanent redirect for legacy `/articles/<handle>` URLs to the canonical
 * `/blogs/<blogHandle>/<articleHandle>` route. The previous sitemap
 * published `/articles/<handle>` links (which 404), so search engines and
 * external tools may still hold those URLs.
 */
export async function loader({
  params,
  context: { storefront },
}: LoaderFunctionArgs) {
  const articleHandle = params.articleHandle;
  const localePrefix = params.locale ? `/${params.locale.toLowerCase()}` : "";
  if (!articleHandle) {
    throw new Response("Not found", { status: 404 });
  }

  let after: string | null = null;
  // Paginate through all blogs so articles in any blog are found.
  while (true) {
    const data: {
      blogs: {
        nodes: Array<{
          handle: string;
          articleByHandle: { handle: string } | null;
        }>;
        pageInfo: { hasNextPage: boolean; endCursor: string | null };
      };
    } = await storefront.query(ARTICLE_BLOG_LOOKUP_QUERY, {
      variables: { handle: articleHandle, after },
    });

    const blog = data.blogs.nodes.find((node) => node.articleByHandle);
    if (blog) {
      return redirect(
        `${localePrefix}/blogs/${blog.handle}/${articleHandle}`,
        301,
      );
    }
    if (!data.blogs.pageInfo.hasNextPage) {
      break;
    }
    after = data.blogs.pageInfo.endCursor;
  }

  throw new Response("Not found", { status: 404 });
}
