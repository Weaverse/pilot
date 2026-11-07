import { gql, type StorefrontApi } from "@shopify/hydrogen";
import type { RouteLoaderArgs } from "@weaverse/hydrogen/react-router";
import type { MetaArgs } from "react-router";
import invariant from "tiny-invariant";
import { redirectIfHandleIsLocalized } from "~/.server/redirect";
import { seoPayload } from "~/.server/seo";
import { CACHE_DEFAULT, routeHeaders } from "~/utils/cache";
import { seoMetaFromMatches } from "~/utils/seo";
import { unwrapStorefront } from "~/utils/storefront";
import { WeaverseContent } from "~/weaverse";

export const headers = routeHeaders;

export async function loader({ request, params, context }: RouteLoaderArgs) {
  invariant(params.pageHandle, "Missing page handle");
  const { storefront } = context.weaverse;

  // Load page data and weaverseData in parallel
  const [{ page }, weaverseData] = await Promise.all([
    // `$language` is left to Hydrogen, which fills it from the request
    // context — the Shopify provider enum. This client comes from
    // `context.weaverse`, whose `i18n` carries the market's *public* code
    // because Weaverse keys translations by it, so passing it explicitly would
    // send bare `ZH` and Shopify would answer in English.
    storefront
      .graphql(PAGE_QUERY, {
        variables: { handle: params.pageHandle },
        cache: CACHE_DEFAULT,
      })
      .then(unwrapStorefront),
    context.weaverse.loadPage({
      type: "PAGE",
      handle: params.pageHandle,
    }),
  ]);

  if (!page) {
    throw new Response(null, { status: 404 });
  }
  redirectIfHandleIsLocalized(request, {
    handle: params.pageHandle,
    data: page,
  });

  const seo = seoPayload.page({ page, url: request.url });
  return { page, seo, weaverseData };
}

export const meta = ({ matches }: MetaArgs<typeof loader>) => {
  return seoMetaFromMatches(matches);
};

export default function Page() {
  return <WeaverseContent />;
}

const PAGE_QUERY = gql(`
  query PageDetails($language: LanguageCode, $handle: String!)
  @inContext(language: $language) {
    page(handle: $handle) {
      id
      title
      handle
      body
      seo {
        description
        title
      }
    }
  }
`);

export type PageDetailsQuery = StorefrontApi.ResultOf<typeof PAGE_QUERY>;
