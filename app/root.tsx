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
import { Analytics, getSeoMeta, useNonce } from "@shopify/hydrogen";
import type {
  LinksFunction,
  LoaderFunctionArgs,
  MetaArgs,
} from "@shopify/remix-oxygen";
import { defer } from "@shopify/remix-oxygen";
import { useThemeSettings, withWeaverse } from "@weaverse/hydrogen";
import type { CSSProperties } from "react";
import { Footer } from "~/components/layout/footer";
import { Header } from "~/components/layout/header";
import { CustomAnalytics } from "~/components/root/custom-analytics";
import { GlobalLoading } from "~/components/root/global-loading";
import { TooltipProvider } from "~/components/tooltip";
import { DEFAULT_LOCALE } from "~/utils/const";
import { loadCriticalData, loadDeferredData } from "~/utils/root.server";
import { ScrollingAnnouncement } from "./components/layout/scrolling-announcement";
import { GenericError } from "./components/root/generic-error";
import { NotFound } from "./components/root/not-found";
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

export let meta = ({ data }: MetaArgs<typeof loader>) => {
  return getSeoMeta(data?.seo as SeoConfig);
};

export function Layout({ children }: { children?: React.ReactNode }) {
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
              <div
                className="flex flex-col min-h-screen"
                key={`${locale.language}-${locale.country}`}
              >
                <div className="">
                  <a href="#mainContent" className="sr-only">
                    Skip to content
                  </a>
                </div>
                <ScrollingAnnouncement />
                <Header />
                <main id="mainContent" className="flex-grow">
                  {children}
                </main>
                <Footer />
              </div>
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
    <Outlet />
  );
}

export default withWeaverse(App);

export function ErrorBoundary({ error }: { error: Error }) {
  let routeError: { status?: number; data?: any } = useRouteError();
  let isRouteError = isRouteErrorResponse(routeError);

  let pageType = "page";

  if (isRouteError) {
    if (routeError.status === 404) {
      pageType = routeError.data || pageType;
    }
  }

  return isRouteError ? (
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
  )
}
