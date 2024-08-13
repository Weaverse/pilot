/// <reference types="vite/client" />
/// <reference types="@shopify/remix-oxygen" />
/// <reference types="@shopify/oxygen-workers-types" />

// Enhance TypeScript's built-in typings.
import "@total-typescript/ts-reset";

import type {
  HydrogenContext,
  HydrogenEnv,
  HydrogenSessionData,
} from "@shopify/hydrogen";
import type { createAppLoadContext } from "~/lib/context";

declare global {
  /**
   * A global `process` object is only available during build to access NODE_ENV.
   */
  const process: { env: { NODE_ENV: "production" | "development" } };

  interface Env extends HydrogenEnv {
    // declare additional Env parameter use in the fetch handler and Remix loader context here
    PUBLIC_GOOGLE_GTM_ID: string;
    JUDGEME_PRIVATE_API_TOKEN: string;
  }
}

declare module "@shopify/remix-oxygen" {
  interface AppLoadContext
    extends Awaited<ReturnType<typeof createAppLoadContext>> {
    // to change context type, change the return of createAppLoadContext() instead
  }

  interface SessionData extends HydrogenSessionData {
    // declare local additions to the Remix session data here
  }
}
