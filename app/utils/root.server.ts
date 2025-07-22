import { getShopAnalytics } from "@shopify/hydrogen";
import type { AppLoadContext, LoaderFunctionArgs } from "react-router";
import type {
  LayoutQuery,
  MenuFragment,
  SwatchesQuery,
} from "storefront-api.generated";
import invariant from "tiny-invariant";
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
  const [layout, swatchesConfigs, weaverseTheme] = await Promise.all([
    getLayoutData(context),
    getSwatchesConfigs(context),
    // Add other queries here, so that they are loaded in parallel
    context.weaverse.loadThemeSettings(),
  ]);

  const seo = seoPayload.root({ shop: layout.shop, url: request.url });

  const { storefront, env } = context;
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
      withPrivacyBanner: false,
      // localize the privacy banner
      country: storefront.i18n.country,
      language: storefront.i18n.language,
    },
    selectedLocale: storefront.i18n,
    weaverseTheme,
    googleGtmID: env.PUBLIC_GOOGLE_GTM_ID,
    swatchesConfigs,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
export function loadDeferredData({ context }: LoaderFunctionArgs) {
  const { cart, customerAccount } = context;

  return {
    isLoggedIn: customerAccount.isLoggedIn(),
    cart: cart.get(),
  };
}

async function getLayoutData({ storefront, env }: AppLoadContext) {
  const data = await storefront
    .query<LayoutQuery>(LAYOUT_QUERY, {
      variables: {
        headerMenuHandle: "main-menu",
        footerMenuHandle: "footer",
        language: storefront.i18n.language,
      },
    })
    // biome-ignore lint/suspicious/noConsole: <explanation> --- IGNORE ---
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
  const { metaobjects } = await context.storefront.query<SwatchesQuery>(
    SWATCHES_QUERY,
    { variables: { type } },
  );
  const colors: Swatch[] = [];
  const images: Swatch[] = [];
  for (const { id, fields } of metaobjects.nodes) {
    const { value: color } = fields.find(({ key }) => key === "color") || {};
    const { reference: imageRef } =
      fields.find(({ key }) => key === "image") || {};
    const { value: name } = fields.find(({ key }) => key === "label") || {};
    if (imageRef) {
      const url = imageRef?.image?.url;
      if (url) {
        images.push({ id, name, value: url });
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
    // biome-ignore lint/suspicious/noConsole: <explanation> --- IGNORE ---
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
    item:
      | MenuFragment["items"][number]
      | MenuFragment["items"][number]["items"][number],
  ):
    | EnhancedMenu["items"][0]
    | EnhancedMenu["items"][number]["items"][0]
    | null => {
    if (!(item?.url && item?.type)) {
      // biome-ignore lint/suspicious/noConsole: <explanation> --- IGNORE ---
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

  switch (true) {
    // special cases
    case type === "FRONTPAGE":
      return "/";
    case type === "ARTICLE": {
      const blogHandle = pathParts.pop();
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

const LAYOUT_QUERY = `#graphql
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

  fragment ChildMenuItem on MenuItem {
    ...MenuItem
  }
  fragment ParentMenuItem2 on MenuItem {
    ...MenuItem
    items {
      ...ChildMenuItem
    }
  }
  fragment ParentMenuItem on MenuItem {
    ...MenuItem
    items {
      ...ParentMenuItem2
    }
  }
  fragment Menu on Menu {
    id
    items {
      ...ParentMenuItem
    }
  }
` as const;

const SWATCHES_QUERY = `#graphql
  query swatches($type: String!) {
    metaobjects(first: 250, type: $type) {
      nodes {
        id
        fields {
          key
          value
          reference {
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
` as const;
