import type { HydrogenThemeSchema } from "@weaverse/hydrogen";
import { COUNTRIES } from "~/utils/const";
import { version } from "../../package.json";
import { animationsSettings } from "./settings/animations";
import { announcementSettings } from "./settings/announcements";
import { cartSettings } from "./settings/cart";
import { colorSettings } from "./settings/colors";
import { footerSettings } from "./settings/footer";
import { headerSettings } from "./settings/header";
import { layoutSettings } from "./settings/layout";
import { newsletterSettings } from "./settings/newsletter";
import { productBadgesSettings } from "./settings/product-badges";
import { productCardsSettings } from "./settings/product-cards";
import { searchSettings } from "./settings/search";
import { typographySettings } from "./settings/typography";

export const themeSchema: HydrogenThemeSchema = {
  info: {
    version,
    author: "Weaverse",
    name: "Pilot",
    authorProfilePhoto:
      "https://cdn.shopify.com/s/files/1/0838/0052/3057/files/Weaverse_logo_-_3000x_e2fa8c13-dac2-4dcb-a2c2-f7aaf7a58169.png?v=1698245759",
    documentationUrl: "https://docs.weaverse.io",
    supportUrl: "https://help.weaverse.io/",
  },
  i18n: {
    urlStructure: "url-path",
    defaultLocale: {
      pathPrefix: "",
      label: "United States (USD $)",
      language: "EN",
      country: "US",
      currency: "USD",
    },
    shopLocales: Object.entries(COUNTRIES).map(
      ([pathPrefix, { label, language, country }]) => {
        return {
          pathPrefix: pathPrefix === "default" ? "" : pathPrefix,
          label,
          language,
          country,
        };
      },
    ),
  },
  settings: [
    layoutSettings,
    announcementSettings,
    headerSettings,
    colorSettings,
    typographySettings,
    productBadgesSettings,
    productCardsSettings,
    animationsSettings,
    newsletterSettings,
    searchSettings,
    cartSettings,
    footerSettings,
  ],
};
