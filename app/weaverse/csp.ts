export function getWeaverseCsp(
  request: Request,
  env: { WEAVERSE_HOST?: string },
) {
  const url = new URL(request.url);
  // Get weaverse host from query params
  const weaverseHost =
    url.searchParams.get("weaverseHost") || env.WEAVERSE_HOST;
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
    connectSrc: [
      "vimeo.com",
      "*.shopifysvc.com",
      "*.google-analytics.com",
      ...weaverseHosts,
    ],
    styleSrc: weaverseHosts,
    // `scriptSrc` replaces `defaultSrc` for scripts, so it lists every script
    // origin itself: the Studio bridge (loaded without a nonce), YouTube's
    // iframe API and Google Tag Manager.
    scriptSrc: [
      "'self'",
      "https://cdn.shopify.com",
      "https://www.youtube.com",
      "*.googletagmanager.com",
      "*.google-analytics.com",
      ...weaverseHosts,
    ],
  };
  if (isDesignMode) {
    updatedCsp.frameAncestors = ["*"];
  }
  return updatedCsp;
}
