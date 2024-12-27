import { getShopAnalytics } from "@shopify/hydrogen";
import type { AppLoadContext, LoaderFunctionArgs } from "@shopify/remix-oxygen";
import {
  type ColorSwatch,
  type ImageSwatch,
  resizeShopifyImage,
} from "@weaverse/hydrogen";
import type {
  LayoutQuery,
  MenuFragment,
  SwatchesConfigsQuery,
} from "storefront-api.generated";
import invariant from "tiny-invariant";
import { LAYOUT_QUERY, SWATCHES_CONFIGS_QUERY } from "~/graphql/queries";
import type { EnhancedMenu } from "~/types/menu";
import { seoPayload } from "~/utils/seo.server";

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
export async function loadCriticalData({
  request,
  context,
}: LoaderFunctionArgs) {
  let [layout, swatchesConfigs] = await Promise.all([
    getLayoutData(context),
    getSwatchesConfigs(context),
    // Add other queries here, so that they are loaded in parallel
  ]);

  let seo = seoPayload.root({ shop: layout.shop, url: request.url });

  let { storefront, env } = context;

  return {
    layout,
    seo,
    shop: getShopAnalytics({
      storefront,
      publicStorefrontId: env.PUBLIC_STOREFRONT_ID,
    }),
    consent: {
      checkoutDomain: env.PUBLIC_CHECKOUT_DOMAIN,
      storefrontAccessToken: env.PUBLIC_STOREFRONT_API_TOKEN,
      withPrivacyBanner: true,
      // localize the privacy banner
      country: storefront.i18n.country,
      language: storefront.i18n.language,
    },
    selectedLocale: storefront.i18n,
    weaverseTheme: await context.weaverse.loadThemeSettings(),
    googleGtmID: context.env.PUBLIC_GOOGLE_GTM_ID,
    swatchesConfigs,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
export function loadDeferredData({ context }: LoaderFunctionArgs) {
  let { cart, customerAccount } = context;

  return {
    isLoggedIn: customerAccount.isLoggedIn(),
    cart: cart.get(),
  };
}

async function getLayoutData({ storefront, env }: AppLoadContext) {
  let data = await storefront
    .query<LayoutQuery>(LAYOUT_QUERY, {
      variables: {
        headerMenuHandle: "main-menu",
        footerMenuHandle: "footer",
        language: storefront.i18n.language,
      },
    })
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
  let customPrefixes = { CATALOG: "products" };

  let headerMenu = data?.headerMenu
    ? parseMenu(
        data.headerMenu,
        data.shop.primaryDomain.url,
        env,
        customPrefixes,
      )
    : undefined;

  let footerMenu = data?.footerMenu
    ? parseMenu(
        data.footerMenu,
        data.shop.primaryDomain.url,
        env,
        customPrefixes,
      )
    : undefined;

  return { shop: data.shop, headerMenu, footerMenu };
}

async function getSwatchesConfigs(context: AppLoadContext) {
  let { METAOBJECT_COLORS_TYPE: type } = context.env;
  if (!type) {
    return { colors: [], images: [] };
  }
  let { metaobjects } = await context.storefront.query<SwatchesConfigsQuery>(
    SWATCHES_CONFIGS_QUERY,
    { variables: { type } },
  );
  let colors: ColorSwatch[] = [];
  let images: ImageSwatch[] = [];
  for (let { id, fields } of metaobjects.nodes) {
    let { value: color } = fields.find(({ key }) => key === "color") || {};
    let { reference: imageRef } =
      fields.find(({ key }) => key === "image") || {};
    let { value: name } = fields.find(({ key }) => key === "label") || {};
    if (imageRef) {
      let url = imageRef?.image?.url;
      if (url) {
        images.push({ id, name, value: resizeShopifyImage(url, "300x") });
      }
    } else if (color) {
      colors.push({ id, name, value: color });
    }
  }
  return { colors, images };
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
    // eslint-disable-next-line no-console
    console.warn("Invalid menu passed to parseMenu");
    return null;
  }
  let parser = parseItem(primaryDomain, env, customPrefixes);
  let parsedMenu = {
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
    item:
      | MenuFragment["items"][number]
      | MenuFragment["items"][number]["items"][number],
  ):
    | EnhancedMenu["items"][0]
    | EnhancedMenu["items"][number]["items"][0]
    | null => {
    if (!item?.url || !item?.type) {
      // eslint-disable-next-line no-console
      console.warn("Invalid menu item.  Must include a url and type.");
      return null;
    }

    // extract path from url because we don't need the origin on internal to attributes
    let { host, pathname } = new URL(item.url);
    let isInternalLink =
      host === new URL(primaryDomain).host || host === env.PUBLIC_STORE_DOMAIN;
    let parsedItem = isInternalLink
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
          // @ts-ignore
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
  if (!pathname || !type) return "";

  /*
    MenuItemType enum
    @see: https://shopify.dev/api/storefront/unstable/enums/MenuItemType
  */
  let defaultPrefixes = {
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

  let pathParts = pathname.split("/");
  let handle = pathParts.pop() || "";
  let routePrefix: Record<string, string> = {
    ...defaultPrefixes,
    ...customPrefixes,
  };

  switch (true) {
    // special cases
    case type === "FRONTPAGE":
      return "/";
    case type === "ARTICLE": {
      let blogHandle = pathParts.pop();
      return routePrefix.BLOG
        ? `/${routePrefix.BLOG}/${blogHandle}/${handle}/`
        : `/${blogHandle}/${handle}/`;
    }
    case type === "COLLECTIONS":
      return `/${routePrefix.COLLECTIONS}`;
    case type === "SEARCH":
      return `/${routePrefix.SEARCH}`;
    case type === "CATALOG":
      return `/${routePrefix.CATALOG}`;
    // common cases: BLOG, PAGE, COLLECTION, PRODUCT, SHOP_POLICY, HTTP
    default:
      return routePrefix[type]
        ? `/${routePrefix[type]}/${handle}`
        : `/${handle}`;
  }
}
