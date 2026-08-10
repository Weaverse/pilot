export interface SpotifyTrack {
  title: string
  artist: string
  album: string
  albumImageUrl?: string
  songUrl?: string
  playedAt?: string
}

export interface SpotifyPayload {
  ok: boolean
  status: 'playing' | 'recently-played' | 'unavailable'
  isPlaying: boolean
  song?: SpotifyTrack
  error?: string
}

/**
 * Live site-wide stats for the home cards + build-log manifest. Each field comes from a
 * different source and degrades independently to `null` (so a partial outage still shows the
 * rest, and the UI renders `—` for the missing one instead of faking it):
 *   - `hits` / `online` / `visitors` — Umami via its public share token (no auth credentials);
 *     `hits24h` / `visitors24h` are the same metrics for the last 24 hours.
 *   - `reactions` — `SUM(loves+applauses+ideas+bullseyes)` across the `stats` table.
 *   - `commits` / `stars` — the GitHub repo via GraphQL.
 */
export interface SiteStatsPayload {
  ok: boolean
  hits: number | null
  online: number | null
  visitors: number | null
  hits24h: number | null
  visitors24h: number | null
  reactions: number | null
  commits: number | null
  stars: number | null
  error?: string
}

export interface GithubContributionDay {
  date: string
  contributionCount: number
  contributionLevel:
    | 'NONE'
    | 'FIRST_QUARTILE'
    | 'SECOND_QUARTILE'
    | 'THIRD_QUARTILE'
    | 'FOURTH_QUARTILE'
    | string
  weekday?: number
}

export interface GithubDayPayload {
  ok: boolean
  username: string
  date: string
  contributions: number | null
  commits: number | null
  additions: number | null
  deletions: number | null
  issues?: number | null
  pullRequests?: number | null
  reviews?: number | null
  error?: string
}

export interface GithubTodayPayload extends GithubDayPayload {}

export interface GithubStreakPayload {
  ok: boolean
  username: string
  fromDate: string
  toDate: string
  heatmap: GithubContributionDay[]
  error?: string
}

export interface ActivityItem {
  type: 'book' | 'movie' | 'spotify' | 'github' | 'build'
  title: string
  subtitle?: string
  url?: string
  imageUrl?: string
  meta?: string
}

export interface ActivityPayload {
  ok: boolean
  items: ActivityItem[]
  error?: string
}

export interface TokenBurnWindow {
  cost: number
  tokens: number
  sessions: number
  messages: number
}

export interface TokenBurnModelSlice {
  model: string
  cost: number
  tokens: number
}

export interface TokenBurnPayload {
  ok: boolean
  allTime: TokenBurnWindow
  today: TokenBurnWindow
  last7Days: TokenBurnWindow
  last30Days: TokenBurnWindow
  topModels: TokenBurnModelSlice[]
  machines: string[]
  lastActivity?: string
  error?: string
}

export interface TokenBurnDailyPoint {
  date: string
  tokens: number
  cost: number
  sessions: number
}

/**
 * The `/llms` page's richer view. Same time windows as `TokenBurnPayload`, plus
 * the all-time per-model breakdown and the full `daily[]` time series that the
 * compact rail widget drops.
 */
export interface TokenBurnFullPayload {
  ok: boolean
  allTime: TokenBurnWindow
  today: TokenBurnWindow
  last7Days: TokenBurnWindow
  last30Days: TokenBurnWindow
  allTimeModels: TokenBurnModelSlice[]
  daily: TokenBurnDailyPoint[]
  machines: string[]
  lastActivity?: string
  error?: string
}
