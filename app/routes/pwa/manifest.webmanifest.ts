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
  const [theme, { shop }] = await Promise.all([
    context.weaverse.loadThemeSettings() as Promise<ThemeSettings | null>,
    context.storefront.query<PwaShopQuery>(PWA_SHOP_QUERY, {
      cache: CacheLong(),
    }),
  ]);

  if (!theme?.pwaEnabled) {
    return new Response("Not found", { status: 404 });
  }

  const icon = theme.pwaIcon as WeaverseImage | undefined;
  const iconUrl = icon?.url || shop?.brand?.logo?.image?.url;
  const name = (theme.pwaName || "").trim() || shop?.name || "Store";
  const shortName = (theme.pwaShortName || "").trim() || name.slice(0, 12);

  const manifest = {
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    name,
    short_name: shortName,
    theme_color: theme.pwaThemeColor || "#ffffff",
    background_color: theme.pwaBackgroundColor || "#ffffff",
    icons: iconUrl ? buildIcons(iconUrl) : [],
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
  return [
    { src: cdnSize(url, 192), sizes: "192x192", type: "image/png" },
    { src: cdnSize(url, 512), sizes: "512x512", type: "image/png" },
    // Same asset reused as maskable; merchants wanting perfect safe-zone
    // padding upload a padded icon.
    {
      src: cdnSize(url, 512),
      sizes: "512x512",
      type: "image/png",
      purpose: "maskable",
    },
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
