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
    styleSrc: ["https://fonts.googleapis.com", ...weaverseHosts],
    // Google Fonts stylesheets (added by third-party widgets) load their
    // font files from fonts.gstatic.com.
    fontSrc: [
      "'self'",
      "data:",
      "https://cdn.shopify.com",
      "https://fonts.gstatic.com",
    ],
    // `scriptSrc` replaces `defaultSrc` for scripts, so it lists every script
    // origin itself: the Studio bridge (loaded without a nonce), YouTube's
    // iframe API, Hydrogen's 3D model viewer and Google Tag Manager.
    scriptSrc: [
      "'self'",
      "https://cdn.shopify.com",
      "https://www.youtube.com",
      "https://unpkg.com",
      "*.googletagmanager.com",
      "*.google-analytics.com",
      ...weaverseHosts,
    ],
  };
  if (isDesignMode) {
    updatedCsp.frameAncestors = ["*"];
    // The Studio bridge rebuilds schema `condition` functions from strings.
    (updatedCsp.scriptSrc as string[]).push("'unsafe-eval'");
  }
  return updatedCsp;
}
