/// <reference types="vite/client" />
/// <reference types="react-router" />
/// <reference types="@shopify/oxygen-workers-types" />

// Enhance TypeScript's built-in typings.
import "@total-typescript/ts-reset";
import type { WeaverseEnv } from "@weaverse/hydrogen/react-router";
import type { AppContext } from "./app/.server/context";

declare global {
  /** The Oxygen worker bindings (`.env` locally). */
  interface Env extends WeaverseEnv {
    SESSION_SECRET: string;
    PUBLIC_STORE_DOMAIN: string;
    PUBLIC_STOREFRONT_API_TOKEN?: string;
    /** Injected by Oxygen for a linked storefront; enables the private client. */
    PRIVATE_STOREFRONT_API_TOKEN?: string;
    PUBLIC_STOREFRONT_ID?: string;
    PUBLIC_CHECKOUT_DOMAIN: string;
    SHOP_ID: string;
    PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID: string;
    PUBLIC_GOOGLE_GTM_ID: string;
    JUDGEME_PRIVATE_API_TOKEN: string;
    CUSTOM_COLLECTION_BANNER_METAFIELD: string;
    METAOBJECT_COLORS_TYPE: string;
    KLAVIYO_PRIVATE_API_TOKEN: string;
    PUBLIC_SHOPIFY_INBOX_SHOP_ID: string;
    WEAVERSE_HOST?: string;
    WEAVERSE_PROJECT_ID: string;
    WEAVERSE_API_KEY?: string;
  }

  interface Window {
    dataLayer: any[];
  }
}

declare module "react-router" {
  // `server.ts` copies the app context onto React Router's context; to change
  // its shape, change `createAppContext()` instead.
  interface AppLoadContext extends AppContext {}
  interface RouterContextProvider extends AppContext {}

  // TODO: remove this once we've migrated our loaders to `Route.LoaderArgs`
  interface LoaderFunctionArgs {
    context: AppLoadContext;
  }

  // TODO: remove this once we've migrated our actions to `Route.ActionArgs`
  interface ActionFunctionArgs {
    context: AppLoadContext;
  }
}
