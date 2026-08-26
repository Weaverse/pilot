import type { HydrogenThemeSchema } from "@weaverse/hydrogen";
import staticContent from "~/i18n/en.json" with { type: "json" };
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "~/utils/locale";
import packageJson from "../../package.json" with { type: "json" };
import { announcementSettings } from "./settings/announcements";
import { cartSettings } from "./settings/cart";
import { footerSettings } from "./settings/footer";
import { generalSettings } from "./settings/general";
import { headerSettings } from "./settings/header";
import { linksButtonsSettings } from "./settings/links-buttons";
import { newsletterSettings } from "./settings/newsletter";
import { productBadgesSettings } from "./settings/product-badges";
import { productCardsSettings } from "./settings/product-cards";
import { pwaSettings } from "./settings/pwa";
import { searchSettings } from "./settings/search";
import { shopifyChatSettings } from "./settings/shopify-chat";
import { typographySettings } from "./settings/typography";

export const themeSchema: HydrogenThemeSchema = {
  info: {
    version: packageJson.version,
    author: "Weaverse",
    name: "Pilot",
    authorProfilePhoto:
      "https://cdn.shopify.com/s/files/1/0838/0052/3057/files/Weaverse_logo_-_3000x_e2fa8c13-dac2-4dcb-a2c2-f7aaf7a58169.png?v=1698245759",
    documentationUrl: "https://docs.weaverse.io",
    supportUrl: "https://help.weaverse.io/",
  },
  i18n: {
    // `translation: true` + `staticContent` are what Studio's Translation
    // Manager reads: without them it reports "not configured" and Sync Theme
    // Keys finds nothing. `en.json` stays the source language.
    translation: true,
    staticContent,
    urlStructure: "url-path",
    defaultLocale: DEFAULT_LOCALE,
    shopLocales: SUPPORTED_LOCALES,
  },
  settings: [
    generalSettings,
    typographySettings,
    linksButtonsSettings,
    announcementSettings,
    headerSettings,
    productBadgesSettings,
    productCardsSettings,
    newsletterSettings,
    searchSettings,
    cartSettings,
    pwaSettings,
    shopifyChatSettings,
    footerSettings,
  ],
};
