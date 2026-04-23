import { getSitemapIndex } from "@shopify/hydrogen";
import type { LoaderFunctionArgs } from "react-router";

export async function loader({
  request,
  context: { storefront },
}: LoaderFunctionArgs) {
  const response = await getSitemapIndex({
    storefront,
    request,
  });

  // Add Weaverse custom pages sitemap to the index
  const sitemapXml = await response.text();
  const url = new URL(request.url);
  const weaverseSitemapUrl = `${url.protocol}//${url.host}/sitemap-weaverse.xml`;
  
  // Insert Weaverse sitemap before closing sitemapindex tag
  const modifiedXml = sitemapXml.replace(
    "</sitemapindex>",
    `  <sitemap>\n    <loc>${weaverseSitemapUrl}</loc>\n  </sitemap>\n</sitemapindex>`
  );

  return new Response(modifiedXml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": `max-age=${60 * 60 * 24}`,
    },
  });
}
