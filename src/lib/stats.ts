/**
 * Client-side compatibility layer for views + reactions.
 *
 * It targets the legacy `/api/stats` contract (GET `?slug=&type=`, POST a partial row).
 * v4 also includes `api/stats.ts` as a Vercel Function for persisted production writes.
 * Plain `astro preview` does not serve Vercel Functions, so every call here still degrades
 * gracefully: a missing/404/erroring endpoint yields `null` (reads) or `false` (writes)
 * instead of throwing. The widgets then render fallback UI and never pretend a write was persisted.
 *
 * In plain `astro preview`, the Vercel Function is absent; with `DATABASE_URL` on Vercel,
 * the same calls persist via `api/stats.ts`.
 */
import type { SiteStatsPayload } from '~/types/integrations'
import type { BlogStats, StatsType } from '~/types/stats'

const STATS_ENDPOINT = '/api/stats'
const SITE_STATS_ENDPOINT = '/api/site-stats.json'
export const SITE_STATS_REFRESH_INTERVAL_MS = 30_000

export function emptyStats(type: StatsType, slug: string): BlogStats {
  return {
    type,
    slug,
    views: 0,
    loves: 0,
    applauses: 0,
    ideas: 0,
    bullseyes: 0,
  }
}

function normalize(
  type: StatsType,
  slug: string,
  data: Partial<BlogStats>,
): BlogStats {
  return {
    type,
    slug,
    views: data.views ?? 0,
    loves: data.loves ?? 0,
    applauses: data.applauses ?? 0,
    ideas: data.ideas ?? 0,
    bullseyes: data.bullseyes ?? 0,
  }
}

/** Read stats for a slug. Returns `null` when the endpoint is unavailable (static build). */
export async function fetchStats(
  type: StatsType,
  slug: string,
): Promise<BlogStats | null> {
  try {
    const params = new URLSearchParams({ slug, type })
    const res = await fetch(`${STATS_ENDPOINT}?${params.toString()}`)
    if (!res.ok) return null
    const data = (await res.json()) as Partial<BlogStats>
    return normalize(type, slug, data)
  } catch {
    return null
  }
}

/**
 * Persist a partial stats update. Returns `true` only on a real persisted success;
 * a 404/unavailable endpoint returns `false` so the UI never fakes persistence.
 */
export async function postStats(
  update: Partial<BlogStats> & { type: StatsType; slug: string },
): Promise<boolean> {
  try {
    const res = await fetch(STATS_ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(update),
    })
    return res.ok
  } catch {
    return false
  }
}

const SITE_STATS_TTL_MS = 15_000
let siteStatsCache: { at: number; data: SiteStatsPayload } | null = null
let siteStatsInflight: Promise<SiteStatsPayload> | null = null

function unavailableSiteStats(): SiteStatsPayload {
  return {
    ok: false,
    hits: null,
    online: null,
    visitors: null,
    hits24h: null,
    visitors24h: null,
    reactions: null,
    commits: null,
    stars: null,
  }
}

/**
 * Read live site-wide stats (traffic, reactions, repo) from `/api/site-stats.json`. Returns a
 * `null`-field payload when the endpoint is unavailable so the UI shows `—`.
 *
 * The home-page islands call this for live numbers; the short TTL cache + in-flight dedup
 * keeps their repeated/poll reads to a single network request.
 */
export async function fetchSiteStats(): Promise<SiteStatsPayload> {
  const now = Date.now()
  if (siteStatsCache && now - siteStatsCache.at < SITE_STATS_TTL_MS) {
    return siteStatsCache.data
  }
  if (siteStatsInflight) return siteStatsInflight

  siteStatsInflight = (async () => {
    try {
      const res = await fetch(SITE_STATS_ENDPOINT)
      const data: SiteStatsPayload = res.ok
        ? ((await res.json()) as SiteStatsPayload)
        : unavailableSiteStats()
      siteStatsCache = { at: Date.now(), data }
      return data
    } catch {
      return unavailableSiteStats()
    } finally {
      siteStatsInflight = null
    }
  })()

  return siteStatsInflight
}
