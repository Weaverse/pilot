/**
 * Per-request projectId resolution for cloud-sandbox-backed previews.
 *
 * The Weaverse Hydrogen SDK already resolves `?weaverseProjectId=<id>` from
 * the URL with highest priority (see WeaverseClient.resolveProjectIdSync).
 * What it does NOT do is persist that choice across subsequent navigation
 * inside the iframe \u2014 once the user clicks a link and the query string is
 * gone, the SDK falls through to `env.WEAVERSE_PROJECT_ID` and the wrong
 * theme renders.
 *
 * This module bridges that gap with a small cookie:
 *
 *   1. {@link readProjectIdFromCookie} \u2014 used by `WeaverseClient`'s
 *      `projectId` resolver as the priority-2 fallback (function). Returns
 *      the cookie value when present, empty string otherwise (so the SDK
 *      continues falling through to env on a miss).
 *
 *   2. {@link maybeSetProjectIdCookie} \u2014 called after the request handler
 *      returns. If the URL contained `?weaverseProjectId=<id>`, mints a
 *      Set-Cookie header with a 24h max-age so the next nav without the
 *      query string still resolves the same project.
 *
 * Studio iframe rule (Phase 1 spec): Studio ALWAYS sets the query string
 * explicitly when loading the preview iframe. The cookie is a fallback for
 * in-iframe navigation only, never trusted cross-tab. Phase 1.5 spec:
 * .specs/2026-05-12--cloud-sandbox-phase-1/README.md
 */

const COOKIE_NAME = "weaverseProjectId";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24; // 24h
// Project IDs are CUID-shape today (alphanumeric + hyphens + underscores).
// Mirrors the validation in @weaverse/hydrogen's WeaverseClient. Reject
// anything else so a poisoned cookie can't inject arbitrary header bytes.
const VALID_PROJECT_ID = /^[a-zA-Z0-9_-]{1,128}$/;

export function readProjectIdFromCookie(request: Request): string {
  const header = request.headers.get("Cookie");
  if (!header) return "";

  // Hand-rolled parse \u2014 small enough that pulling in cookie lib is overkill,
  // and we already validate format on the way out anyway.
  for (const part of header.split(";")) {
    const [rawName, ...rawValue] = part.trim().split("=");
    if (rawName !== COOKIE_NAME) continue;
    const value = decodeURIComponent(rawValue.join("=") ?? "");
    return VALID_PROJECT_ID.test(value) ? value : "";
  }
  return "";
}

/**
 * If the request URL contains `?weaverseProjectId=<id>`, append a Set-Cookie
 * header to `response` so subsequent navigation in the same iframe keeps
 * using that project.
 *
 * No-op if the query param is absent or the value is malformed. Existing
 * Set-Cookie headers (session, cart, etc.) are preserved by using append().
 */
export function maybeSetProjectIdCookie(
  request: Request,
  response: Response,
): void {
  const url = new URL(request.url);
  const incoming = url.searchParams.get("weaverseProjectId");
  if (!incoming || !VALID_PROJECT_ID.test(incoming)) return;

  // SameSite=Lax is fine: Studio iframe lives on a different origin
  // (studio.weaverse.io) but the cookie is for the sandbox origin
  // (<handle>.weaverse.dev) which IS the top-level navigation when the
  // SDK reads it. Strict would break in-iframe nav.
  const cookie = [
    `${COOKIE_NAME}=${encodeURIComponent(incoming)}`,
    "Path=/",
    `Max-Age=${COOKIE_MAX_AGE_SECONDS}`,
    "SameSite=Lax",
    "Secure",
    "HttpOnly",
  ].join("; ");
  response.headers.append("Set-Cookie", cookie);
}
