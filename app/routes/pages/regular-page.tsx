import type { RouteLoaderArgs } from "@weaverse/hydrogen";
import type { MetaArgs } from "react-router";
import type { PageDetailsQuery } from "storefront-api.generated";
import invariant from "tiny-invariant";
import { redirectIfHandleIsLocalized } from "~/.server/redirect";
import { seoPayload } from "~/.server/seo";
import { routeHeaders } from "~/utils/cache";
import { seoMetaFromMatches } from "~/utils/seo";
import { WeaverseContent } from "~/weaverse";

export const headers = routeHeaders;

export async function loader({ request, params, context }: RouteLoaderArgs) {
  invariant(params.pageHandle, "Missing page handle");
  const { storefront } = context.weaverse;

  // Load page data and weaverseData in parallel
  const [{ page }, weaverseData] = await Promise.all([
    // `$language` is left to Hydrogen, which fills it from the storefront
    // client's own closure — the Shopify provider enum. This client comes from
    // `context.weaverse`, whose `i18n` carries the market's *public* code
    // because Weaverse keys translations by it, so passing it explicitly would
    // send bare `ZH` and Shopify would answer in English.
    storefront.query<PageDetailsQuery>(PAGE_QUERY, {
      variables: { handle: params.pageHandle },
    }),
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

const PAGE_QUERY = `#graphql
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
`;
