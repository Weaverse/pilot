import { SITE } from '~/lib/site'
import { timeoutSignal } from './shared'

/**
 * Umami public share auth, derived entirely from the public share URL in `SITE.analytics`
 * — no username/password or API key. Flow:
 *   1. `GET {base}/api/share/{shareId}` → `{ websiteId, token }` (a read-only JWT).
 *   2. Pass that token as `x-umami-share-token` on the website data endpoints.
 * The share token carries no `exp`, so we cache it for a few hours and only re-resolve on a
 * 401/403 (rotated share link) — see `umamiWebsiteFetch`.
 */
type UmamiShareAuth = { base: string; websiteId: string; token: string }

const UMAMI_AUTH_TTL_MS = 6 * 60 * 60 * 1000
let umamiAuthCache: { value: UmamiShareAuth; expiresAt: number } | null = null

function parseUmamiShare(): { base: string; shareId: string } | null {
  try {
    const url = new URL(SITE.analytics.umamiShareUrl)
    const parts = url.pathname.split('/').filter(Boolean)
    const shareIdx = parts.indexOf('share')
    const shareId = shareIdx >= 0 ? parts[shareIdx + 1] : undefined
    return shareId ? { base: url.origin, shareId } : null
  } catch {
    return null
  }
}

async function getUmamiShareAuth(): Promise<UmamiShareAuth | null> {
  const now = Date.now()
  if (umamiAuthCache && umamiAuthCache.expiresAt > now)
    return umamiAuthCache.value

  const parsed = parseUmamiShare()
  if (!parsed) return null

  const res = await fetch(`${parsed.base}/api/share/${parsed.shareId}`, {
    signal: timeoutSignal(),
  })
  if (!res.ok) return null

  const data = (await res.json()) as { token?: string; websiteId?: string }
  if (!data.token || !data.websiteId) return null

  const value: UmamiShareAuth = {
    base: parsed.base,
    websiteId: data.websiteId,
    token: data.token,
  }
  umamiAuthCache = { value, expiresAt: now + UMAMI_AUTH_TTL_MS }
  return value
}

/** Fetch a website data endpoint with the share token, re-resolving once on 401/403. */
async function umamiWebsiteFetch(
  path: string,
  retry = true,
): Promise<Response | null> {
  const auth = await getUmamiShareAuth()
  if (!auth) return null

  const res = await fetch(
    `${auth.base}/api/websites/${auth.websiteId}${path}`,
    {
      headers: {
        'x-umami-share-token': auth.token,
        // v3 requires this alongside the share token, else every request 401s.
        'x-umami-share-context': '1',
      },
      signal: timeoutSignal(),
    },
  )

  if ((res.status === 401 || res.status === 403) && retry) {
    umamiAuthCache = null
    return umamiWebsiteFetch(path, false)
  }
  return res
}

/**
 * Umami traffic numbers: all-time pageviews + visitors, the same for the last 24h, plus active
 * visitors right now.
 */
export type UmamiTraffic = {
  hits: number | null
  online: number | null
  visitors: number | null
  hits24h: number | null
  visitors24h: number | null
}

const DAY_MS = 24 * 60 * 60 * 1000

/**
 * Parse a v3 `/stats` response into flat pageviews + visitors.
 * v3 returns flat numbers (`{ pageviews: N, visitors: N, ... }`); v2 wrapped them as
 * `{ pageviews: { value: N } }` — we only support v3 now, so read the plain numbers.
 */
async function parseUmamiStats(
  res: Response | null,
): Promise<{ hits: number | null; visitors: number | null }> {
  if (!res?.ok) return { hits: null, visitors: null }
  const data = (await res.json()) as { pageviews?: number; visitors?: number }
  return {
    hits: typeof data.pageviews === 'number' ? data.pageviews : null,
    visitors: typeof data.visitors === 'number' ? data.visitors : null,
  }
}

export async function fetchUmamiTraffic(): Promise<UmamiTraffic> {
  const empty: UmamiTraffic = {
    hits: null,
    online: null,
    visitors: null,
    hits24h: null,
    visitors24h: null,
  }
  try {
    const auth = await getUmamiShareAuth()
    if (!auth) return empty

    const now = Date.now()
    const dayAgo = now - DAY_MS
    const [activeRes, statsRes, stats24hRes] = await Promise.all([
      umamiWebsiteFetch('/active'),
      umamiWebsiteFetch(`/stats?startAt=0&endAt=${now}`),
      umamiWebsiteFetch(`/stats?startAt=${dayAgo}&endAt=${now}`),
    ])

    let online: number | null = null
    if (activeRes?.ok) {
      // Umami v1 returns `{ x }`, v2 `{ visitors }`.
      const data = (await activeRes.json()) as { x?: number; visitors?: number }
      online =
        typeof data.x === 'number'
          ? data.x
          : typeof data.visitors === 'number'
            ? data.visitors
            : null
    }

    const allTime = await parseUmamiStats(statsRes)
    const last24h = await parseUmamiStats(stats24hRes)

    return {
      hits: allTime.hits,
      online,
      visitors: allTime.visitors,
      hits24h: last24h.hits,
      visitors24h: last24h.visitors,
    }
  } catch {
    return empty
  }
}
