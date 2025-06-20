import type { SeoConfig } from "@shopify/hydrogen";
import { getSeoMeta } from "@shopify/hydrogen";
import type { RouteLoaderArgs } from "@weaverse/hydrogen";
import type { MetaFunction } from "react-router";
import type { PageDetailsQuery } from "storefront-api.generated";
import invariant from "tiny-invariant";

import { routeHeaders } from "~/utils/cache";
import { redirectIfHandleIsLocalized } from "~/utils/redirect";
import { seoPayload } from "~/utils/seo.server";
import { WeaverseContent } from "~/weaverse";

export const headers = routeHeaders;

export async function loader({ request, params, context }: RouteLoaderArgs) {
  invariant(params.pageHandle, "Missing page handle");
  const { storefront } = context.weaverse;

  // Load page data and weaverseData in parallel
  const [{ page }, weaverseData] = await Promise.all([
    storefront.query<PageDetailsQuery>(PAGE_QUERY, {
      variables: {
        handle: params.pageHandle,
        language: storefront.i18n.language,
      },
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

  return {
    page,
    seo,
    weaverseData,
  };
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return getSeoMeta(data?.seo as SeoConfig);
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
