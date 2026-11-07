import type { WritableCustomerSessionManager } from "@shopify/hydrogen/customer-account";
import {
  createCookieSessionStorage,
  type Session,
  type SessionStorage,
} from "react-router";

/**
 * The signed cookie session that Customer Account handlers read and write.
 *
 * It implements Hydrogen's session-manager contract on top of React Router's
 * cookie storage. The cookie is signed, not encrypted, and holds only the
 * customer's OAuth state and tokens. It is committed once per response in
 * `server.ts`, and only when something changed, so an anonymous page never
 * gets a `Set-Cookie` that would make it uncacheable.
 */
export class AppSession implements WritableCustomerSessionManager {
  isPending = false;
  readonly #storage: SessionStorage;
  readonly #session: Session;
  readonly #origin: string;

  constructor(storage: SessionStorage, session: Session, origin: string) {
    this.#storage = storage;
    this.#session = session;
    this.#origin = origin;
  }

  static async init(request: Request, secrets: string[]) {
    const storage = createCookieSessionStorage({
      cookie: {
        name: "session",
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        // Customer Account OAuth only runs over HTTPS; plain-HTTP local dev
        // still needs a readable cookie for the rest of the session.
        secure: new URL(request.url).protocol === "https:",
        secrets,
      },
    });
    const session = await storage
      .getSession(request.headers.get("Cookie"))
      .catch(() => storage.getSession());

    return new AppSession(storage, session, new URL(request.url).origin);
  }

  getSessionOrigin() {
    return this.#origin;
  }

  getSessionItem(key: string) {
    return this.#session.get(key);
  }

  setSessionItem(key: string, value: unknown) {
    this.isPending = true;
    this.#session.set(key, value);
  }

  removeSessionItem(key: string) {
    this.isPending = true;
    this.#session.unset(key);
  }

  async commit() {
    if (!this.isPending) return;
    this.isPending = false;
    return { "Set-Cookie": await this.#storage.commitSession(this.#session) };
  }
}
