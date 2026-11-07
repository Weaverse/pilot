import {
  type ConsentConfig,
  gql,
  type ShopifyScriptsI18n,
  type ShopifyScriptsShop,
  type StorefrontApi,
} from "@shopify/hydrogen";
import type { AppLoadContext, LoaderFunctionArgs } from "react-router";
import invariant from "tiny-invariant";
import type {
  EnhancedMenu,
  MenuFragment,
  MenuItemFragment,
} from "~/types/menu";
import { CACHE_LONG } from "~/utils/cache";
import { unwrapStorefront } from "~/utils/storefront";
import {
  isThemeUnavailable,
  neutralThemeWhenUnavailable,
} from "~/weaverse/load-failure";
import { seoPayload } from "./seo";
import { localizedThemePayload } from "./translations";

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
export async function loadCriticalData({
  request,
  context,
}: LoaderFunctionArgs) {
  const [layout, weaverseTheme] = await Promise.all([
    getLayoutData(context),
    context.weaverse.loadThemeSettings(),
  ]);

  const seo = seoPayload.root({ shop: layout.shop, url: request.url });

  const { storefront, env } = context;
  return {
    layout,
    seo,
    shopifyScripts: getShopifyScriptsConfig(context, layout.shop.id),
    consent: {
      // Shopify's hosted privacy banner (classic `withPrivacyBanner: true`).
      mode: "default-banner",
      // Public token, read by the privacy banner (`#shopify-features`) and
      // the header's `<shopify-store>` web component.
      storefrontAccessToken: env.PUBLIC_STOREFRONT_API_TOKEN,
    } satisfies Pick<ConsentConfig, "mode"> & {
      storefrontAccessToken?: string;
    },
    selectedLocale: storefront.i18n,
    weaverseTheme: neutralThemeWhenUnavailable(
      localizedThemePayload(weaverseTheme, storefront.i18n),
    ),
    themeUnavailable: isThemeUnavailable(weaverseTheme),
    googleGtmID: env.PUBLIC_GOOGLE_GTM_ID,
    publicStoreDomain: env.PUBLIC_STORE_DOMAIN,
  };
}

/**
 * The `shop` and `i18n` props of `<ShopifyScripts>` (replaces classic
 * `getShopAnalytics`). Everything here is per-market, never per-shopper, so
 * the document stays full-page cacheable.
 *
 * - `shopId`: the numeric `SHOP_ID` when set, else the Shop GID from the
 *   layout query (the bus normalizes both to a GID).
 * - Without a `PUBLIC_STOREFRONT_ID` there is nothing to attribute Hydrogen
 *   channel analytics to: `""` keeps PerfKit off, the channel is `headless`,
 *   and Shopify's analytics script isn't loaded.
 * - `language` is Shopify's provider language (`ZH_TW`, not `ZH`), the same
 *   `LanguageCode` the Storefront API served this page's content in and the
 *   one classic `getShopAnalytics`/consent received. Shopify's scripts
 *   lowercase it into `window.Shopify.locale`, Monorail's content language.
 */
function getShopifyScriptsConfig(
  { storefront, env }: AppLoadContext,
  shopGid: string,
) {
  const storefrontId = env.PUBLIC_STOREFRONT_ID || "";
  const shop: ShopifyScriptsShop = {
    shopId: env.SHOP_ID || shopGid,
    storefrontId,
    myshopifyDomain: env.PUBLIC_STORE_DOMAIN,
  };
  const i18n: ShopifyScriptsI18n = {
    country: storefront.i18n.country,
    language: storefront.i18n.language,
    pathPrefix: storefront.i18n.pathPrefix,
    currency: storefront.i18n.currency,
  };
  return {
    shop,
    i18n,
    channel: storefrontId ? ("hydrogen" as const) : ("headless" as const),
    shopifyAnalytics: storefrontId !== "",
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 *
 * NOTE: keep this loader free of personalized data (cart, customer tokens).
 * Deferred values stream into the HTML document, and the document must stay
 * anonymous for Oxygen's full-page cache (see entry.server.tsx). The cart
 * store (`CartProvider`, rendered without `initialData`) loads the cart from
 * `/api/cart` after hydration.
 */
export function loadDeferredData(args: LoaderFunctionArgs) {
  return {
    swatchesConfigs: getSwatchesConfigs(args.context),
  };
}

async function getLayoutData({ storefront, env }: AppLoadContext) {
  const data = await storefront
    .graphql(LAYOUT_QUERY, {
      variables: {
        headerMenuHandle: "main-menu",
        footerMenuHandle: "footer",
      },
      cache: CACHE_LONG,
    })
    .then(unwrapStorefront)
    .catch(console.error);

  invariant(data, "No data returned from Shopify API");

  /*
      Modify specific links/routes (optional)
      @see: https://shopify.dev/api/storefront/unstable/enums/MenuItemType
      e.g here we map:
        - /blogs/news -> /news
        - /blog/news/blog-post -> /news/blog-post
        - /collections/all -> /products
    */
  const customPrefixes = { CATALOG: "products" };

  const headerMenu = data?.headerMenu
    ? parseMenu(
        data.headerMenu,
        data.shop.primaryDomain.url,
        env,
        customPrefixes,
      )
    : undefined;

  const footerMenu = data?.footerMenu
    ? parseMenu(
        data.footerMenu,
        data.shop.primaryDomain.url,
        env,
        customPrefixes,
      )
    : undefined;

  return { shop: data.shop, headerMenu, footerMenu };
}

type Swatch = {
  id: string;
  name: string;
  value: string;
};

async function getSwatchesConfigs(context: AppLoadContext) {
  const { METAOBJECT_COLORS_TYPE: type } = context.env;
  if (!type) {
    return { colors: [], images: [] };
  }
  try {
    const { metaobjects } = unwrapStorefront(
      await context.storefront.graphql(SWATCHES_QUERY, {
        variables: { type },
        cache: CACHE_LONG,
      }),
    );
    const colors: Swatch[] = [];
    const images: Swatch[] = [];
    for (const { id, fields } of metaobjects.nodes) {
      const { value: color } = fields.find(({ key }) => key === "color") || {};
      const { reference: imageRef } =
        fields.find(({ key }) => key === "image") || {};
      const { value: name } = fields.find(({ key }) => key === "label") || {};
      if (imageRef) {
        const url =
          imageRef.__typename === "MediaImage" ? imageRef.image?.url : null;
        if (url) {
          images.push({ id, name, value: url });
        }
      } else if (color) {
        colors.push({ id, name, value: color });
      }
    }
    return { colors, images };
  } catch {
    return { colors: [], images: [] };
  }
}

/*
  Recursively adds `to` and `target` attributes to links based on their url
  and resource type.
  It optionally overwrites url paths based on item.type
*/
function parseMenu(
  menu: MenuFragment,
  primaryDomain: string,
  env: Env,
  customPrefixes = {},
): EnhancedMenu | null {
  if (!menu?.items) {
    console.warn("Invalid menu passed to parseMenu");
    return null;
  }
  const parser = parseItem(primaryDomain, env, customPrefixes);
  const parsedMenu = {
    ...menu,
    items: menu.items.map(parser).filter(Boolean),
  } as EnhancedMenu;

  return parsedMenu;
}

/*
  Parse each menu link and adding, isExternal, to and target
*/
function parseItem(primaryDomain: string, env: Env, customPrefixes = {}) {
  return (
    item: MenuFragment["items"][number] | MenuItemFragment,
  ):
    | EnhancedMenu["items"][0]
    | EnhancedMenu["items"][number]["items"][0]
    | null => {
    if (!(item?.url && item?.type)) {
      console.warn("Invalid menu item.  Must include a url and type.");
      return null;
    }

    // extract path from url because we don't need the origin on internal to attributes
    const { host, pathname } = new URL(item.url);
    const isInternalLink =
      host === new URL(primaryDomain).host || host === env.PUBLIC_STORE_DOMAIN;
    const parsedItem = isInternalLink
      ? // internal links
        {
          ...item,
          isExternal: false,
          target: "_self",
          to: resolveToFromType({ type: item.type, customPrefixes, pathname }),
        }
      : // external links
        {
          ...item,
          isExternal: true,
          target: "_blank",
          to: item.url,
        };

    if ("items" in item) {
      return {
        ...parsedItem,
        items: item.items
          .map(parseItem(primaryDomain, env, customPrefixes))
          .filter(Boolean),
      } as EnhancedMenu["items"][number];
    }
    return parsedItem as EnhancedMenu["items"][number]["items"][number];
  };
}

function resolveToFromType(
  {
    customPrefixes,
    pathname,
    type,
  }: {
    customPrefixes: Record<string, string>;
    pathname?: string;
    type?: string;
  } = {
    customPrefixes: {},
  },
) {
  if (!(pathname && type)) {
    return "";
  }

  /*
    MenuItemType enum
    @see: https://shopify.dev/api/storefront/unstable/enums/MenuItemType
  */
  const defaultPrefixes = {
    BLOG: "blogs",
    COLLECTION: "collections",
    COLLECTIONS: "collections", // Collections All (not documented)
    FRONTPAGE: "frontpage",
    HTTP: "",
    PAGE: "pages",
    CATALOG: "collections/all", // Products All
    PRODUCT: "products",
    SEARCH: "search",
    SHOP_POLICY: "policies",
  };

  const pathParts = pathname.split("/");
  const handle = pathParts.pop() || "";
  const routePrefix: Record<string, string> = {
    ...defaultPrefixes,
    ...customPrefixes,
  };

  switch (type) {
    // special cases
    case "FRONTPAGE":
      return "/";
    case "ARTICLE": {
      const blogHandle = pathParts.pop();
      return routePrefix.BLOG
        ? `/${routePrefix.BLOG}/${blogHandle}/${handle}/`
        : `/${blogHandle}/${handle}/`;
    }
    case "COLLECTIONS":
      return `/${routePrefix.COLLECTIONS}`;
    case "SEARCH":
      return `/${routePrefix.SEARCH}`;
    case "CATALOG":
      return `/${routePrefix.CATALOG}`;
    // common cases: BLOG, PAGE, COLLECTION, PRODUCT, SHOP_POLICY, HTTP
    default:
      return routePrefix[type]
        ? `/${routePrefix[type]}/${handle}`
        : `/${handle}`;
  }
}

const MENU_ITEM_FRAGMENT = gql(`
  fragment MenuItem on MenuItem {
    id
    resourceId
    resource {
      ... on Collection {
        image {
          altText
          height
          id
          url
          width
        }
      }
      ... on Product {
        image: featuredImage {
          altText
          height
          id
          url
          width
        }
      }
    }
    tags
    title
    type
    url
  }
`);

// Three levels deep: parent → child → grandchild, as the classic
// `ParentMenuItem`/`ParentMenuItem2`/`ChildMenuItem` fragments selected.
const MENU_FRAGMENT = gql(
  `
  fragment Menu on Menu {
    id
    items {
      ...MenuItem
      items {
        ...MenuItem
        items {
          ...MenuItem
        }
      }
    }
  }
`,
  [MENU_ITEM_FRAGMENT],
);

const SHOP_FRAGMENT = gql(`
  fragment Shop on Shop {
    id
    name
    description
    primaryDomain {
      url
    }
    brand {
      logo {
        image {
          url
        }
      }
    }
  }
`);

const LAYOUT_QUERY = gql(
  `
  query layout(
    $language: LanguageCode
    $headerMenuHandle: String!
    $footerMenuHandle: String!
  ) @inContext(language: $language) {
    shop {
      ...Shop
    }
    headerMenu: menu(handle: $headerMenuHandle) {
      ...Menu
    }
    footerMenu: menu(handle: $footerMenuHandle) {
      ...Menu
    }
  }
`,
  [SHOP_FRAGMENT, MENU_FRAGMENT],
);

export type LayoutQuery = StorefrontApi.ResultOf<typeof LAYOUT_QUERY>;

const SWATCHES_QUERY = gql(`
  query swatches($type: String!) {
    metaobjects(first: 250, type: $type) {
      nodes {
        id
        fields {
          key
          value
          reference {
            __typename
            ... on MediaImage {
              image {
                id
                altText
                url: url(transform: { maxWidth: 300 })
                width
                height
              }
            }
          }
        }
      }
    }
  }
`);
