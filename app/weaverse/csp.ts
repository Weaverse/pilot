import type { ContentSecurityPolicyDirectives } from "@shopify/hydrogen";
import { getWeaverseStudioCspDirectives } from "@weaverse/hydrogen/react-router";

/**
 * Third-party origins the theme's sections and integrations load from:
 * YouTube and Vimeo embeds, Google Maps, Google Tag Manager / Analytics,
 * and jsDelivr. Hydrogen sets image, media and frame sources
 * apart from `default-src`, so the list extends each of them.
 */
const THEME_SOURCES = [
  "data:",
  "*.youtube.com",
  "*.youtu.be",
  "*.vimeo.com",
  "*.google.com",
  "*.google-analytics.com",
  "*.googletagmanager.com",
  "cdn.jsdelivr.net",
];

/**
 * Pilot's additions to Hydrogen's default policy; each array extends
 * Hydrogen's default for that directive. Merchant uploads are served from
 * cdn.shopify.com, which Hydrogen already allows.
 */
const THEME_DIRECTIVES = {
  defaultSrc: THEME_SOURCES,
  imgSrc: THEME_SOURCES,
  mediaSrc: THEME_SOURCES,
  frameSrc: THEME_SOURCES,
  connectSrc: ["vimeo.com", "*.google-analytics.com"],
  styleSrc: ["https://fonts.googleapis.com"],
  // Google Fonts stylesheets (added by third-party widgets) load their font
  // files from fonts.gstatic.com.
  fontSrc: ["data:", "https://fonts.gstatic.com"],
  // The document carries no nonce so Oxygen's full-page cache can store it,
  // and React Router's streamed hydration scripts differ per response, so
  // they cannot be hashed: inline scripts are allowed instead. External
  // scripts: YouTube's iframe API, Hydrogen's 3D model viewer, Google Tag
  // Manager.
  scriptSrc: [
    "'unsafe-inline'",
    "https://www.youtube.com",
    "https://unpkg.com",
    "*.googletagmanager.com",
    "*.google-analytics.com",
  ],
} satisfies ContentSecurityPolicyDirectives;

/**
 * The theme's CSP directives, plus Weaverse Studio's inside Studio. The SDK
 * adds the Studio origin only when `weaverseHost` is a trusted Studio host,
 * so a crafted `?weaverseHost=` cannot widen the policy.
 *
 * A store with its own domain gets Shopify-hosted video files on that domain
 * (`https://<checkout domain>/cdn/shop/videos/...`), not on cdn.shopify.com,
 * so the checkout domain is a media source too.
 */
export function getCspDirectives(
  request: Request,
  checkoutDomain?: string,
): ContentSecurityPolicyDirectives {
  const directives: ContentSecurityPolicyDirectives = { ...THEME_DIRECTIVES };
  if (checkoutDomain) {
    directives.mediaSrc = [
      ...(directives.mediaSrc ?? []),
      `https://${checkoutDomain.replace(/^https?:\/\//, "")}`,
    ];
  }
  const studio = getWeaverseStudioCspDirectives(request);
  for (const key of Object.keys(studio) as (keyof typeof studio)[]) {
    directives[key] = [...(directives[key] ?? []), ...(studio[key] ?? [])];
  }
  return directives;
}
