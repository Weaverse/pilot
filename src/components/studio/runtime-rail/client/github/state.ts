import type {
  GithubContributionDay,
  GithubDayPayload,
  GithubTodayPayload,
} from '~/types/integrations'

export const HEAT_LEVEL_CLASSES: Record<string, string> = {
  NONE: 'border-[#dde6ee] bg-[#eef3f7] hover:bg-[#e3ebf2]',
  FIRST_QUARTILE: 'border-[#9ae6b4] bg-[#bbf7d0] hover:bg-[#a7f3c2]',
  SECOND_QUARTILE: 'border-[#4ade80] bg-[#86efac] hover:bg-[#74e89d]',
  THIRD_QUARTILE: 'border-[#22c55e] bg-[#4ade80] hover:bg-[#35d56f]',
  FOURTH_QUARTILE: 'border-[#15803d] bg-[#16a34a] hover:bg-[#15803d]',
}

const GITHUB_DAY_CACHE_PREFIX = 'leohuynh:github-day:v1:'
const GITHUB_DAY_TTL = 24 * 60 * 60 * 1000
const GITHUB_TODAY_TTL = 5 * 60 * 1000

// Mutable rail state shared across the github modules. Kept on one object so the
// heat/detail modules can both read and reassign it (ESM `export let` bindings
// are read-only from the importing side).
export const githubState: {
  todayPayload: GithubTodayPayload | null
  selectedDate: string | null
  dayAbort: AbortController | null
} = {
  todayPayload: null,
  selectedDate: null,
  dayAbort: null,
}

export function formatGithubDate(date: string): string {
  const [year, month, day] = date.split('-').map(Number)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(Date.UTC(year, month - 1, day)))
}

export function contributionLabel(count: number | null | undefined): string {
  const value = count ?? 0
  return `${value.toLocaleString()} contribution${value === 1 ? '' : 's'}`
}

export function heatClass(day: GithubContributionDay): string {
  return HEAT_LEVEL_CLASSES[day.contributionLevel] ?? HEAT_LEVEL_CLASSES.NONE
}

export function readGithubDayCache(date: string): GithubDayPayload | null {
  try {
    const raw = localStorage.getItem(`${GITHUB_DAY_CACHE_PREFIX}${date}`)
    if (!raw) return null
    const parsed = JSON.parse(raw) as {
      payload?: GithubDayPayload
      timestamp?: number
    }
    const ttl =
      date === githubState.todayPayload?.date
        ? GITHUB_TODAY_TTL
        : GITHUB_DAY_TTL
    if (
      !parsed.timestamp ||
      !parsed.payload ||
      Date.now() - parsed.timestamp > ttl
    ) {
      return null
    }
    return parsed.payload
  } catch {
    return null
  }
}

export function writeGithubDayCache(payload: GithubDayPayload) {
  try {
    localStorage.setItem(
      `${GITHUB_DAY_CACHE_PREFIX}${payload.date}`,
      JSON.stringify({ payload, timestamp: Date.now() }),
    )
  } catch {
    // Cache is an enhancement only.
  }
}
