import type { HydrogenSession } from "@shopify/hydrogen";
import { createHydrogenContext } from "@shopify/hydrogen";
import { WeaverseClient } from "@weaverse/hydrogen";
import {
  createCookieSessionStorage,
  type Session,
  type SessionStorage,
} from "react-router";
import { CART_QUERY_FRAGMENT } from "~/graphql/fragments";
import { readProjectIdFromCookie } from "~/lib/weaverse/resolve-project.server";
import type { I18nLocale } from "~/types/others";
import { COUNTRIES } from "~/utils/const";
import { components } from "~/weaverse/components";
import { themeSchema } from "~/weaverse/schema.server";

const additionalContext = {
  // Additional context for custom properties, CMS clients, 3P SDKs, etc.
} as const;

type AdditionalContextType = typeof additionalContext;

declare global {
  interface HydrogenAdditionalContext extends AdditionalContextType {}
}

export async function createHydrogenRouterContext(
  request: Request,
  env: Env,
  executionContext: ExecutionContext,
) {
  if (!env?.SESSION_SECRET) {
    throw new Error("SESSION_SECRET environment variable is not set");
  }

  const waitUntil = executionContext.waitUntil.bind(executionContext);
  const [cache, session] = await Promise.all([
    caches.open("hydrogen"),
    AppSession.init(request, [env.SESSION_SECRET]),
  ]);

  const hydrogenContext = createHydrogenContext(
    {
      env,
      request,
      cache,
      waitUntil,
      session,
      i18n: getLocaleFromRequest(request),
      cart: { queryFragment: CART_QUERY_FRAGMENT },
    },
    additionalContext,
  );

  const weaverse = new WeaverseClient({
    ...hydrogenContext,
    request,
    cache,
    themeSchema,
    components,
    // Multi-project resolution priority chain handled by the SDK:
    //   1. ?weaverseProjectId=<id> query param (Studio iframe always sets this)
    //   2. this function — reads a 24h cookie set by the response for
    //      in-iframe navigation without the query string
    //   3. env.WEAVERSE_PROJECT_ID (bare URL fallback)
    // See app/lib/weaverse/resolve-project.server.ts and Phase 1.5c spec.
    projectId: () => readProjectIdFromCookie(request),
  });

  // Add weaverse directly to the hydrogenContext instance
  // This preserves the RouterContextProvider class instance
  Object.assign(hydrogenContext, { weaverse });

  return hydrogenContext;
}

class AppSession implements HydrogenSession {
  isPending = false;
  readonly #sessionStorage: SessionStorage;
  readonly #session: Session;

  constructor(sessionStorage: SessionStorage, session: Session) {
    this.#sessionStorage = sessionStorage;
    this.#session = session;
  }

  static async init(request: Request, secrets: string[]) {
    const storage = createCookieSessionStorage({
      cookie: {
        name: "session",
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        secrets,
      },
    });

    const session = await storage
      .getSession(request.headers.get("Cookie"))
      .catch(() => storage.getSession());

    return new AppSession(storage, session);
  }

  get has() {
    return this.#session.has;
  }

  get get() {
    return this.#session.get;
  }

  get flash() {
    return this.#session.flash;
  }

  get unset() {
    this.isPending = true;
    return this.#session.unset;
  }

  get set() {
    this.isPending = true;
    return this.#session.set;
  }

  destroy() {
    return this.#sessionStorage.destroySession(this.#session);
  }

  commit() {
    this.isPending = false;
    return this.#sessionStorage.commitSession(this.#session);
  }
}

function getLocaleFromRequest(request: Request): I18nLocale {
  const url = new URL(request.url);
  let firstPathPart = `/${url.pathname.substring(1).split("/")[0].toLowerCase()}`;
  firstPathPart = firstPathPart.replace(".data", "");

  return COUNTRIES[firstPathPart]
    ? {
        ...COUNTRIES[firstPathPart],
        pathPrefix: firstPathPart,
      }
    : {
        ...COUNTRIES.default,
        pathPrefix: "",
      };
}
