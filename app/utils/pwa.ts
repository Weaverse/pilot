/** Square center-crop via Shopify CDN params; foreign hosts pass through untouched. */
export function cdnSize(url: string, px: number): string {
  try {
    let u = new URL(url);
    if (u.hostname !== "cdn.shopify.com") {
      return url;
    }
    u.searchParams.set("width", String(px));
    u.searchParams.set("height", String(px));
    u.searchParams.set("crop", "center");
    return u.toString();
  } catch {
    return url;
  }
}
