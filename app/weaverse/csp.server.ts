export function getWeaverseCsp(request: Request) {
  let url = new URL(request.url);
  // get weaverse host from query params
  let weaverseHost = url.searchParams.get('weaverseHost');
  let weaverseHosts = ['https://*.weaverse.io'];
  if (weaverseHost) {
    weaverseHosts.push(weaverseHost);
  }
  return {
    frameAncestors: weaverseHosts,
    defaultSrc: [
      "'self'",
      'https://cdn.shopify.com',
      'https://shopify.com',
      'https://*.youtube.com',
      ...weaverseHosts,
    ],
    styleSrc: [
      "'self'",
      "'unsafe-inline'",
      'https://cdn.shopify.com',
      ...weaverseHosts,
    ],
  };
}
