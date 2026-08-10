import type {
  TokenBurnFullPayload,
  TokenBurnModelSlice,
  TokenBurnPayload,
  TokenBurnWindow,
} from '~/types/integrations'
import { hanoiDateRangeOffset, todayInHanoi } from './hanoi-date'
import { env, timeoutSignal } from './shared'

// AI coding token spend, read from a private, pre-aggregated summary JSON via
// the GitHub Contents API. The source URL and PAT both live in env and are only
// used server-side, so neither the endpoint nor the credential reaches the
// client. The summary holds only time-absolute data — `today` / `last7Days` /
// `last30Days` are derived here from `daily[]` using the same Hanoi calendar the
// GitHub rail uses.
type TokenBurnTotals = {
  tokens?: number
  cost?: number
  sessions?: number
  messages?: number
}

type TokenBurnDailyRow = TokenBurnTotals & {
  date: string
  byModel?: Record<string, TokenBurnTotals>
}

type TokenBurnSummary = {
  lastActivity?: string
  machines?: string[]
  allTime?: TokenBurnTotals
  byModel?: Record<string, TokenBurnTotals>
  daily?: TokenBurnDailyRow[]
}

const EMPTY_TOKEN_BURN_WINDOW: TokenBurnWindow = {
  cost: 0,
  tokens: 0,
  sessions: 0,
  messages: 0,
}

function unavailableTokenBurn(error: string): TokenBurnPayload {
  return {
    ok: false,
    allTime: EMPTY_TOKEN_BURN_WINDOW,
    today: EMPTY_TOKEN_BURN_WINDOW,
    last7Days: EMPTY_TOKEN_BURN_WINDOW,
    last30Days: EMPTY_TOKEN_BURN_WINDOW,
    topModels: [],
    machines: [],
    error,
  }
}

function tokenBurnWindow(rows: TokenBurnTotals[]): TokenBurnWindow {
  return rows.reduce<TokenBurnWindow>(
    (acc, row) => ({
      cost: acc.cost + (row.cost ?? 0),
      tokens: acc.tokens + (row.tokens ?? 0),
      sessions: acc.sessions + (row.sessions ?? 0),
      messages: acc.messages + (row.messages ?? 0),
    }),
    { ...EMPTY_TOKEN_BURN_WINDOW },
  )
}

// Turn a `byModel` map into token-sorted slices (tokens lead; cost is secondary).
function modelSlices(
  byModel: Record<string, TokenBurnTotals> | undefined,
  limit?: number,
): TokenBurnModelSlice[] {
  const slices = Object.entries(byModel ?? {})
    .map(([model, totals]) => ({
      model,
      cost: totals.cost ?? 0,
      tokens: totals.tokens ?? 0,
    }))
    .sort((a, b) => b.tokens - a.tokens)
  return limit ? slices.slice(0, limit) : slices
}

function buildTokenBurnPayload(summary: TokenBurnSummary): TokenBurnPayload {
  const today = todayInHanoi()
  const from7 = hanoiDateRangeOffset(today.startMs, -6).date
  const from30 = hanoiDateRangeOffset(today.startMs, -29).date
  const daily = summary.daily ?? []

  const todayRow = daily.find((row) => row.date === today.date)
  // Top models for *today*, tracking the same Hanoi day as the rest of the
  // widget. The UI shows a few and expands the rest via "+n more".
  return {
    ok: true,
    allTime: tokenBurnWindow([summary.allTime ?? {}]),
    today: tokenBurnWindow(todayRow ? [todayRow] : []),
    last7Days: tokenBurnWindow(daily.filter((row) => row.date >= from7)),
    last30Days: tokenBurnWindow(daily.filter((row) => row.date >= from30)),
    topModels: modelSlices(todayRow?.byModel, 10),
    machines: summary.machines ?? [],
    lastActivity: summary.lastActivity,
  }
}

function unavailableTokenBurnFull(error: string): TokenBurnFullPayload {
  return {
    ok: false,
    allTime: EMPTY_TOKEN_BURN_WINDOW,
    today: EMPTY_TOKEN_BURN_WINDOW,
    last7Days: EMPTY_TOKEN_BURN_WINDOW,
    last30Days: EMPTY_TOKEN_BURN_WINDOW,
    allTimeModels: [],
    daily: [],
    machines: [],
    error,
  }
}

function buildTokenBurnFullPayload(
  summary: TokenBurnSummary,
): TokenBurnFullPayload {
  const today = todayInHanoi()
  const from7 = hanoiDateRangeOffset(today.startMs, -6).date
  const from30 = hanoiDateRangeOffset(today.startMs, -29).date
  const daily = summary.daily ?? []
  const todayRow = daily.find((row) => row.date === today.date)

  return {
    ok: true,
    allTime: tokenBurnWindow([summary.allTime ?? {}]),
    today: tokenBurnWindow(todayRow ? [todayRow] : []),
    last7Days: tokenBurnWindow(daily.filter((row) => row.date >= from7)),
    last30Days: tokenBurnWindow(daily.filter((row) => row.date >= from30)),
    allTimeModels: modelSlices(summary.byModel),
    daily: [...daily]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((row) => ({
        date: row.date,
        tokens: row.tokens ?? 0,
        cost: row.cost ?? 0,
        sessions: row.sessions ?? 0,
      })),
    machines: summary.machines ?? [],
    lastActivity: summary.lastActivity,
  }
}

// Fetches the pre-aggregated summary. Both the source URL and the token live in
// env (`TOKEN_BURN_SUMMARY_URL` + `GITHUB_API_TOKEN`) so the private source is
// never hardcoded here; the token already has read access, so no separate PAT.
async function fetchTokenBurnSummary(): Promise<
  { summary: TokenBurnSummary } | { error: string }
> {
  const endpoint = env('TOKEN_BURN_SUMMARY_URL')
  if (!endpoint) return { error: 'TOKEN_BURN_SUMMARY_URL is not configured.' }
  const token = env('GITHUB_API_TOKEN')
  if (!token) return { error: 'GITHUB_API_TOKEN is not configured.' }

  try {
    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.raw+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      signal: timeoutSignal(),
    })

    if (!response.ok) {
      return { error: `summary fetch failed with HTTP ${response.status}.` }
    }

    return { summary: (await response.json()) as TokenBurnSummary }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'summary request failed.',
    }
  }
}

export async function fetchTokenBurn(): Promise<TokenBurnPayload> {
  const result = await fetchTokenBurnSummary()
  if ('error' in result) return unavailableTokenBurn(result.error)
  return buildTokenBurnPayload(result.summary)
}

export async function fetchTokenBurnFull(): Promise<TokenBurnFullPayload> {
  const result = await fetchTokenBurnSummary()
  if ('error' in result) return unavailableTokenBurnFull(result.error)
  return buildTokenBurnFullPayload(result.summary)
}
