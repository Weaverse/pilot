import "@fontsource-variable/cabin"; // Supports weights 400-700
import "@fontsource-variable/newsreader"; // Supports weights 200-900
import { TooltipProvider } from "@radix-ui/react-tooltip";
import type { CartReturn, SeoConfig } from "@shopify/hydrogen";
import { Analytics, getSeoMeta, useNonce } from "@shopify/hydrogen";
import { useThemeSettings, withWeaverse } from "@weaverse/hydrogen";
import type { CSSProperties } from "react";
import type { LinksFunction, LoaderFunctionArgs, MetaArgs } from "react-router";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
  useRouteError,
  useRouteLoaderData,
} from "react-router";
import type { ThemeSettings } from "~/types/weaverse";
import { loadCriticalData, loadDeferredData } from "./.server/root";
import { CartStoreSync, useCartStore } from "./components/cart/store";
import { IconSprite } from "./components/icon-sprite";
import { Footer } from "./components/layout/footer";
import { Header } from "./components/layout/header";
import { ScrollingAnnouncement } from "./components/layout/scrolling-announcement";
import { CustomAnalytics } from "./components/root/custom-analytics";
import { GenericError } from "./components/root/generic-error";
import { GlobalLoading } from "./components/root/global-loading";
import {
  NewsletterPopup,
  useShouldRenderNewsletterPopup,
} from "./components/root/newsletter-popup";
import { NotFound } from "./components/root/not-found";
import styles from "./styles/app.css?url";
import { DEFAULT_LOCALE } from "./utils/const";
import { GlobalStyle } from "./weaverse/style";

export type RootLoader = typeof loader;

export const links: LinksFunction = () => {
  return [
    {
      rel: "preconnect",
      href: "https://cdn.shopify.com",
    },
    {
      rel: "preconnect",
      href: "https://shop.app",
    },
    {
      rel: "preconnect",
      href: "https://www.googletagmanager.com",
    },
    { rel: "icon", type: "image/svg+xml", href: "/favicon.ico" },
  ];
};

export async function loader(args: LoaderFunctionArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {
    ...deferredData,
    ...criticalData,
  };
}

export const meta = ({ data }: MetaArgs<typeof loader>) => {
  return getSeoMeta(data?.seo as SeoConfig);
};

function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: { error: Error }) {
  const routeError: { status?: number; data?: any } = useRouteError();
  const isRouteError = isRouteErrorResponse(routeError);

  let pageType = "page";

  if (isRouteError && routeError.status === 404) {
    pageType = routeError.data || pageType;
  }

  return isRouteError ? (
    routeError.status === 404 ? (
      <NotFound type={pageType} />
    ) : (
      <GenericError
        error={{ message: `${routeError.status} ${routeError.data}` }}
      />
    )
  ) : (
    <GenericError error={error instanceof Error ? error : undefined} />
  );
}

export const Layout = withWeaverse(function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const location = useLocation();
  const nonce = useNonce();
  const data = useRouteLoaderData<RootLoader>("root");
  const locale = data?.selectedLocale ?? DEFAULT_LOCALE;
  const { topbarHeight, topbarText } = useThemeSettings<ThemeSettings>();
  const shouldShowNewsletterPopup = useShouldRenderNewsletterPopup();
  // Cart is bootstrapped client-side (see CartStoreSync) so the SSR document
  // stays anonymous and Oxygen can full-page cache it. The provider re-renders
  // as the store updates, so cart_updated analytics still fire on mutations.
  const serverCart = useCartStore((state) => state.serverCart);

  // Bypass Weaverse theme layout for Hydrogen dev tools
  // See: https://github.com/Weaverse/pilot/issues/321
  if (
    location.pathname === "/subrequest-profiler" ||
    location.pathname === "/graphiql"
  ) {
    return children;
  }

  return (
    <html lang={locale.language}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <script
          id="shopify-features"
          type="application/json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              accessToken: data?.consent?.storefrontAccessToken ?? "",
            }),
          }}
        />
        {/*
         * Pre-initialize window.Shopify as a configurable plain object BEFORE
         * the Shopify account.js web component loads. account.js defines
         * window.Shopify as non-configurable, which later breaks Hydrogen's
         * <ShopifyAnalytics> when it calls Object.defineProperty(window, 'Shopify', ...).
         * Setting it first via assignment ensures account.js reuses this object.
         */}
        <script
          nonce={nonce}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: "window.Shopify = window.Shopify || {};",
          }}
        />
        <link rel="stylesheet" href={styles} />
        <Meta />
        <Links />
        <GlobalStyle />
        {/*
         * Shopify Storefront Web Components are large third-party bundles.
         * Do NOT load them in the document head: the header account button
         * lazy-loads them on hover/focus/click instead, preserving the
         * required script order (web-components.js before account.js).
         */}
      </head>
      <body
        style={
          {
            "--initial-topbar-height": `${topbarText ? topbarHeight : 0}px`,
          } as CSSProperties
        }
        className="bg-background text-body antialiased"
      >
        <IconSprite />
        {data ? (
          <Analytics.Provider
            // CartApiQueryFragment is the same runtime shape cart.get()
            // returned before (pilot's custom cart fragment) — the nominal
            // CartReturn type just demands `metafields` we never query.
            cart={serverCart as unknown as CartReturn}
            shop={data.shop}
            consent={data.consent}
          >
            <CartStoreSync />
            <TooltipProvider disableHoverableContent>
              <div
                className="flex min-h-screen flex-col"
                key={`${locale.language}-${locale.country}`}
              >
                <div className="">
                  <a href="#mainContent" className="sr-only">
                    Skip to content
                  </a>
                </div>
                <ScrollingAnnouncement />
                <Header />
                <main id="mainContent" className="grow">
                  {children}
                </main>
                <Footer />
              </div>
              {shouldShowNewsletterPopup && <NewsletterPopup />}
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
});

export default App;
