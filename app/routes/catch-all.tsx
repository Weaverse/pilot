import { getWeaverseSeoMeta } from "@weaverse/hydrogen";
import type { LoaderFunctionArgs, MetaArgs } from "react-router";
import { routeHeaders } from "~/utils/cache";
import { seoMetaFromMatches, withWeaverseSeo } from "~/utils/seo";
import { validateWeaverseData, WeaverseContent } from "~/weaverse";

export let headers = routeHeaders;

export async function loader({ context }: LoaderFunctionArgs) {
  const weaverseData = await context.weaverse.loadPage({
    type: "CUSTOM",
  });
  validateWeaverseData(weaverseData);

  return {
    weaverseData,
  };
}

export const meta = ({ data, matches }: MetaArgs<typeof loader>) => {
  // Weaverse CUSTOM pages are public and indexable, so they need the market's
  // canonical + hreflang alternates from the root match, not just page SEO.
  return withWeaverseSeo(
    seoMetaFromMatches(matches),
    getWeaverseSeoMeta(data?.weaverseData),
  );
};

export default function Component() {
  return <WeaverseContent />;
}
