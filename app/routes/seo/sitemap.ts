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

  response.headers.set("Cache-Control", `max-age=${60 * 60 * 24}`);
  return response;
}
