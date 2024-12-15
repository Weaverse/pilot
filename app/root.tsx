import poppins400 from "@fontsource/poppins/400.css?url";
import poppins500 from "@fontsource/poppins/500.css?url";
import poppins600 from "@fontsource/poppins/600.css?url";
import poppins700 from "@fontsource/poppins/700.css?url";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  type ShouldRevalidateFunction,
  isRouteErrorResponse,
  useRouteError,
  useRouteLoaderData,
} from "@remix-run/react";
import type { SeoConfig } from "@shopify/hydrogen";
import {
  Analytics,
  getSeoMeta,
  getShopAnalytics,
  useNonce,
} from "@shopify/hydrogen";
import type {
  AppLoadContext,
  LinksFunction,
  LoaderFunctionArgs,
  MetaArgs,
} from "@shopify/remix-oxygen";
import { defer } from "@shopify/remix-oxygen";
import {
  type ColorSwatch,
  useThemeSettings,
  withWeaverse,
} from "@weaverse/hydrogen";
import type { CSSProperties } from "react";
import type { ColorsConfigsQuery, LayoutQuery } from "storefrontapi.generated";
import invariant from "tiny-invariant";
import { CustomAnalytics } from "~/components/custom-analytics";
import { GlobalLoading } from "~/components/global-loading";
import { seoPayload } from "~/lib/seo.server";
import { Layout as PageLayout } from "~/modules/layout";
import { TooltipProvider } from "./components/tooltip";
import { COLORS_CONFIGS_QUERY } from "./data/queries";
import { DEFAULT_LOCALE, parseMenu } from "./lib/utils";
import { GenericError } from "./modules/generic-error";
import { NotFound } from "./modules/not-found";
import styles from "./styles/app.css?url";
import { GlobalStyle } from "./weaverse/style";

export type RootLoader = typeof loader;

export let shouldRevalidate: ShouldRevalidateFunction = ({
  formMethod,
  currentUrl,
  nextUrl,
}) => {
  // revalidate when a mutation is performed e.g add to cart, login...
  if (formMethod && formMethod !== "GET") {
    return true;
  }

  // revalidate when manually revalidating via useRevalidator
  if (currentUrl.toString() === nextUrl.toString()) {
    return true;
  }

  return false;
};

export let links: LinksFunction = () => {
  return [
    {
      rel: "stylesheet",
      href: poppins400,
    },
    {
      rel: "stylesheet",
      href: poppins500,
    },
    {
      rel: "stylesheet",
      href: poppins600,
    },
    {
      rel: "stylesheet",
      href: poppins700,
    },
    { rel: "stylesheet", href: styles },
    {
      rel: "preconnect",
      href: "https://cdn.shopify.com",
    },
    {
      rel: "preconnect",
      href: "https://shop.app",
    },
    { rel: "icon", type: "image/svg+xml", href: "/favicon.ico" },
  ];
};

export async function loader(args: LoaderFunctionArgs) {
  // Start fetching non-critical data without blocking time to first byte
  let deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  let criticalData = await loadCriticalData(args);

  return defer({
    ...deferredData,
    ...criticalData,
  });
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({ request, context }: LoaderFunctionArgs) {
  let [layout, colorsConfigs] = await Promise.all([
    getLayoutData(context),
    getColorsConfigs(context),
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
    colorsConfigs,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({ context }: LoaderFunctionArgs) {
  let { cart, customerAccount } = context;

  return {
    isLoggedIn: customerAccount.isLoggedIn(),
    cart: cart.get(),
  };
}

export let meta = ({ data }: MetaArgs<typeof loader>) => {
  return getSeoMeta(data?.seo as SeoConfig);
};

function Layout({ children }: { children?: React.ReactNode }) {
  let nonce = useNonce();
  let data = useRouteLoaderData<RootLoader>("root");
  let locale = data?.selectedLocale ?? DEFAULT_LOCALE;
  let { topbarHeight, topbarText } = useThemeSettings();

  return (
    <html lang={locale.language}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
        <GlobalStyle />
      </head>
      <body
        style={
          {
            opacity: 0,
            "--initial-topbar-height": `${topbarText ? topbarHeight : 0}px`,
          } as CSSProperties
        }
        className="transition-opacity !opacity-100 duration-300 antialiased bg-background text-body"
      >
        {data ? (
          <Analytics.Provider
            cart={data.cart}
            shop={data.shop}
            consent={data.consent}
          >
            <TooltipProvider disableHoverableContent>
              <PageLayout key={`${locale.language}-${locale.country}`}>
                {children}
              </PageLayout>
            </TooltipProvider>
            <CustomAnalytics />
          </Analytics.Provider>
        ) : (
          children
        )}
        <GlobalLoading />
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

function App() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

export default withWeaverse(App);

export function ErrorBoundary({ error }: { error: Error }) {
  let routeError: { status?: number; data?: any } = useRouteError();
  let isRouteError = isRouteErrorResponse(routeError);

  let pageType = "page";

  if (isRouteError) {
    if (routeError.status === 404) pageType = routeError.data || pageType;
  }

  return (
    <Layout>
      {isRouteError ? (
        <>
          {routeError.status === 404 ? (
            <NotFound type={pageType} />
          ) : (
            <GenericError
              error={{ message: `${routeError.status} ${routeError.data}` }}
            />
          )}
        </>
      ) : (
        <GenericError error={error instanceof Error ? error : undefined} />
      )}
    </Layout>
  );
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

async function getColorsConfigs(context: AppLoadContext) {
  let {
    METAOBJECT_COLORS_TYPE: type,
    METAOBJECT_COLOR_NAME_KEY: nameKey,
    METAOBJECT_COLOR_VALUE_KEY: valueKey,
  } = context.env;
  if (!type || !nameKey || !valueKey) {
    return [];
  }
  let { metaobjects } = await context.storefront.query<ColorsConfigsQuery>(
    COLORS_CONFIGS_QUERY,
    {
      variables: {
        type,
        nameKey,
        valueKey,
      },
    },
  );
  return metaobjects.nodes.map(({ id, name, value }) => {
    return {
      id,
      name: name.value,
      value: value.value,
    };
  }) as ColorSwatch[];
}
