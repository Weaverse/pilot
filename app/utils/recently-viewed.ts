const STORAGE_KEY = "pilot:recently-viewed";
const MAX_PRODUCTS = 12;

/** Product IDs the shopper viewed, most recent first. */
export function getRecentlyViewed(): string[] {
  try {
    let ids = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(ids) ? ids.filter((id) => typeof id === "string") : [];
  } catch {
    // Storage blocked (private mode, disabled cookies) or corrupt.
    return [];
  }
}

export function rememberViewedProduct(id: string) {
  try {
    let ids = [id, ...getRecentlyViewed().filter((other) => other !== id)];
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(ids.slice(0, MAX_PRODUCTS)),
    );
  } catch {
    // Storage blocked: nothing to remember.
  }
}
