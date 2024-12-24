export function routeHeaders({ loaderHeaders }: { loaderHeaders: Headers }) {
  // Keep the same cache-control headers when loading the page directly
  // versus when transitioning to the page from other areas in the app
  return {
    "Cache-Control": loaderHeaders.get("Cache-Control"),
  };
}
