import { CacheLong } from "@shopify/hydrogen";
import type { WeaverseImage } from "@weaverse/hydrogen";
import type { LoaderFunctionArgs } from "react-router";
import type { ThemeSettings } from "~/types/weaverse";
import { cdnSize } from "~/utils/pwa";

/**
 * Web app manifest generated from Weaverse theme settings, so every merchant
 * gets their own branded installable app. Registered top-level (outside the
 * `:locale?` prefix) like robots.txt — browsers request it from the site root.
 */
export async function loader({ context }: LoaderFunctionArgs) {
  let [settingsResponse, { shop }] = await Promise.all([
    context.weaverse.loadThemeSettings(),
    context.storefront.query<PwaShopQuery>(PWA_SHOP_QUERY, {
      cache: CacheLong(),
    }),
  ]);
  // loadThemeSettings returns { theme, schema, publicEnv } — settings live under `theme`.
  let theme = settingsResponse?.theme as ThemeSettings | undefined;

  let icon = theme?.pwaIcon as WeaverseImage | undefined;
  let iconUrl = icon?.url || shop?.brand?.logo?.image?.url;
  // No icon (neither uploaded nor a Shopify brand logo) = not installable:
  // browsers won't offer install without 192/512 icons, so stay 404 rather
  // than advertise a broken manifest. root.tsx gates its tags the same way.
  if (!theme?.pwaEnabled || !iconUrl) {
    return new Response("Not found", { status: 404 });
  }

  let name = (theme.pwaName || "").trim() || shop?.name || "Store";
  let shortName = (theme.pwaShortName || "").trim() || name.slice(0, 12);

  let manifest = {
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    name,
    short_name: shortName,
    theme_color: theme.pwaThemeColor || "#ffffff",
    background_color: theme.pwaBackgroundColor || "#ffffff",
    icons: buildIcons(iconUrl),
  };

  return new Response(JSON.stringify(manifest), {
    status: 200,
    headers: {
      "Content-Type": "application/manifest+json",
      // 1h, not 24h: merchants iterating on branding expect changes same-session.
      "Cache-Control": "public, max-age=3600",
    },
  });
}

function buildIcons(url: string) {
  // `type` is deliberately omitted: the CDN preserves the uploaded format
  // (PNG/JPEG/WebP), so a hardcoded MIME could misdeclare the asset and make
  // browsers reject the icon. Browsers sniff the format when type is absent.
  return [
    { src: cdnSize(url, 192), sizes: "192x192" },
    { src: cdnSize(url, 512), sizes: "512x512" },
    // Same asset reused as maskable; merchants wanting perfect safe-zone
    // padding upload a padded icon.
    { src: cdnSize(url, 512), sizes: "512x512", purpose: "maskable" },
  ];
}

type PwaShopQuery = {
  shop: {
    name: string;
    brand?: { logo?: { image?: { url: string } | null } | null } | null;
  };
};

const PWA_SHOP_QUERY = `#graphql
  query PwaShop {
    shop {
      name
      brand {
        logo {
          image {
            url
          }
        }
      }
    }
  }
`;
