import type { HydrogenRouterContextProvider } from "@shopify/hydrogen";

export function getWeaverseCsp(
  request: Request,
  context: HydrogenRouterContextProvider,
) {
  const url = new URL(request.url);
  // Get weaverse host from query params
  const weaverseHost =
    url.searchParams.get("weaverseHost") || context.env.WEAVERSE_HOST;
  const isDesignMode = url.searchParams.get("weaverseHost");
  const weaverseHosts = ["*.weaverse.io", "*.shopify.com", "*.myshopify.com"];
  if (weaverseHost) {
    weaverseHosts.push(weaverseHost);
  }
  const updatedCsp: {
    [x: string]: string[] | string | boolean;
  } = {
    defaultSrc: [
      "data:",
      "*.youtube.com",
      "*.youtu.be",
      "*.vimeo.com",
      "*.google.com",
      "*.google-analytics.com",
      "*.googletagmanager.com",
      "cdn.alireviews.io",
      "cdn.jsdelivr.net",
      "*.alicdn.com",
      ...weaverseHosts,
    ],
    connectSrc: ["vimeo.com", "*.google-analytics.com", ...weaverseHosts],
    styleSrc: weaverseHosts,
  };
  if (isDesignMode) {
    updatedCsp.frameAncestors = ["*"];
  }
  return updatedCsp;
}
