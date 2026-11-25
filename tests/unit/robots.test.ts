import { expect, test } from "@playwright/test";
import { robotsTxtData } from "../../app/routes/seo/robots";

const ROBOTS = robotsTxtData({ url: "https://shop.test", shopId: "1" });

/** The lines of the group that starts with `User-agent: ${agent}`. */
function group(agent: string) {
  const start = ROBOTS.indexOf(`User-agent: ${agent}\n`);
  const end = ROBOTS.indexOf("\nUser-agent:", start + 1);
  return ROBOTS.slice(start, end === -1 ? undefined : end).split("\n");
}

test("should_block_hydrogen_endpoints_for_every_crawler", () => {
  const all = group("*");
  for (const rule of ["/buy/", "/api/", "/__shopify", "/fr-ca/api/"]) {
    expect(all).toContain(`Disallow: ${rule}`);
  }
});

test("should_block_market_prefixed_cart_account_and_search", () => {
  for (const agent of ["*", "adsbot-google"]) {
    const lines = group(agent);
    for (const path of ["/cart", "/account", "/search"]) {
      expect(lines).toContain(`Disallow: ${path}`);
      expect(lines).toContain(`Disallow: /fr-ca${path}`);
    }
  }
});

test("should_never_use_a_wildcard_prefix_for_page_rules", () => {
  // `/*/cart` would also block `/products/cart-organizer`.
  expect(ROBOTS).not.toMatch(/^Disallow: \/\*\/(cart|account|search)/m);
  expect(ROBOTS).not.toMatch(/Disallow: \/\.well-known\/?$/m);
});
