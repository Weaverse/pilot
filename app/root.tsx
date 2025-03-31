import {
  Outlet,
  isRouteErrorResponse,
  useRouteError,
} from "@remix-run/react";
import type { SeoConfig } from "@shopify/hydrogen";
import { getSeoMeta } from "@shopify/hydrogen";
import type {
  LinksFunction,
  LoaderFunctionArgs,
  MetaArgs,
} from "@shopify/remix-oxygen";
import { GenericError } from "./components/root/generic-error";
import { NotFound } from "./components/root/not-found";
import { loadCriticalData, loadDeferredData } from "./utils/root.server";

export type RootLoader = typeof loader;

export let links: LinksFunction = () => {
  return [
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

  return {
    ...deferredData,
    ...criticalData,
  };
}

export let meta = ({ data }: MetaArgs<typeof loader>) => {
  return getSeoMeta(data?.seo as SeoConfig);
};

export default function App() {
  return <Outlet />;
}

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
  );
}
