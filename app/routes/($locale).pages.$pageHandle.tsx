import type { MetaFunction } from "@remix-run/react";
import type { SeoConfig } from "@shopify/hydrogen";
import { getSeoMeta } from "@shopify/hydrogen";
import { json } from "@shopify/remix-oxygen";
import type { RouteLoaderArgs } from "@weaverse/hydrogen";
import type { PageDetailsQuery } from "storefront-api.generated";
import invariant from "tiny-invariant";

import { routeHeaders } from "~/utils/cache";
import { seoPayload } from "~/utils/seo.server";
import { WeaverseContent } from "~/weaverse";

export const headers = routeHeaders;

export async function loader({ request, params, context }: RouteLoaderArgs) {
  invariant(params.pageHandle, "Missing page handle");
  let { storefront } = context.weaverse;
  let { page } = await storefront.query<PageDetailsQuery>(PAGE_QUERY, {
    variables: {
      handle: params.pageHandle,
      language: storefront.i18n.language,
    },
  });

  if (!page) {
    throw new Response(null, { status: 404 });
  }

  let seo = seoPayload.page({ page, url: request.url });

  return json({
    page,
    seo,
    weaverseData: await context.weaverse.loadPage({
      type: "PAGE",
      handle: params.pageHandle,
    }),
  });
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return getSeoMeta(data!.seo as SeoConfig);
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
      body
      seo {
        description
        title
      }
    }
  }
`;
