import { gql } from "@shopify/hydrogen";
import { type LoaderFunctionArgs, redirect } from "react-router";
import { CACHE_DEFAULT } from "~/utils/cache";
import { localizePath, resolveLocaleFromRequest } from "~/utils/locale";
import { unwrapStorefront } from "~/utils/storefront";

const ARTICLE_BLOG_LOOKUP_QUERY = gql(`
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
`);

/**
 * Permanent redirect for legacy `/articles/<handle>` URLs to the canonical
 * `/blogs/<blogHandle>/<articleHandle>` route. The previous sitemap
 * published `/articles/<handle>` links (which 404), so search engines and
 * external tools may still hold those URLs.
 */
export async function loader({
  params,
  request,
  context: { storefront },
}: LoaderFunctionArgs) {
  const articleHandle = params.articleHandle;
  // `:locale?` is a URL segment, so `%5C` arrives here decoded as `\`.
  // Interpolating it would build the `Location` out of attacker input; the
  // canonical market table answers with a real market or the default one.
  const locale = resolveLocaleFromRequest(request);
  if (!articleHandle) {
    throw new Response("Not found", { status: 404 });
  }

  let after: string | null = null;
  // Paginate through all blogs so articles in any blog are found.
  while (true) {
    const data = unwrapStorefront(
      await storefront.graphql(ARTICLE_BLOG_LOOKUP_QUERY, {
        variables: { handle: articleHandle, after },
        cache: CACHE_DEFAULT,
      }),
    );

    const blog = data.blogs.nodes.find((node) => node.articleByHandle);
    if (blog) {
      return redirect(
        localizePath(`/blogs/${blog.handle}/${articleHandle}`, locale),
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
