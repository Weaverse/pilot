import type {
  ActivityPayload,
  GithubStreakPayload,
  GithubTodayPayload,
  TokenBurnPayload,
} from '~/types/integrations'
import { updateActivity } from './activity'
import { updateGithub } from './github/heat'
import { fetchRuntimeJson } from './shared'
import { syncSpotify } from './spotify-sync'
import { updateTokenBurn } from './token-burn'

function hydrateGithubActivity(rail: HTMLElement) {
  if (rail.dataset.hydrated === 'true') return
  rail.dataset.hydrated = 'true'
  // Three independent sources — each renders as soon as its own fetch
  // resolves, so a slow one never holds back the others. The heatmap (streak)
  // and the today detail share `selectedGithubDate` + `githubTodayPayload`,
  // but updateGithub() guards each branch, so order of arrival is safe.
  fetchRuntimeJson<GithubStreakPayload>('/api/github-streak.json').then(
    (streak) => updateGithub(rail, streak, null),
  )
  fetchRuntimeJson<GithubTodayPayload>('/api/github-today.json').then((today) =>
    updateGithub(rail, null, today),
  )
  fetchRuntimeJson<ActivityPayload>('/api/activity.json').then((activity) =>
    updateActivity(rail, activity),
  )
}

async function hydrateTokenBurn(rail: HTMLElement) {
  if (rail.dataset.tbHydrated === 'true') return
  rail.dataset.tbHydrated = 'true'
  // Fetched independently of the GitHub/activity group so a slow token-burn
  // response never blocks the other rail widgets from rendering.
  const tokenBurn = await fetchRuntimeJson<TokenBurnPayload>(
    '/api/token-burn.json',
  )
  updateTokenBurn(rail, tokenBurn)
}

function hydrateRuntimeRail() {
  const rail = document.querySelector<HTMLElement>('#runtime-rail')
  if (!rail) return
  // GitHub heatmap + activity feed are static for the session — fetch once.
  // The rail node is persisted across route changes (transition:persist),
  // so the dataset flag survives and prevents re-querying on navigation.
  hydrateGithubActivity(rail)
  // token-burn is static for the session too — fetch once, independently.
  hydrateTokenBurn(rail)
  // Spotify stays live across persisted-rail navigation and browser focus.
  syncSpotify()
}

document.addEventListener('astro:page-load', hydrateRuntimeRail)
