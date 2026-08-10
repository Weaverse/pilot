import type { GithubDayPayload } from '~/types/integrations'
import { stat } from '../shared'
import { formatGithubDate } from './state'

export function setGithubDetailTitle(rail: Element, date: string | null) {
  const title = rail.querySelector<HTMLElement>('[data-github-detail-title]')
  const clear = rail.querySelector<HTMLButtonElement>('[data-github-clear]')
  if (title)
    title.textContent = date
      ? `github · ${formatGithubDate(date)}`
      : 'github today'
  if (clear) {
    clear.classList.toggle('hidden', !date)
  }
}

function appendGithubSkeletonRow(
  detail: HTMLElement,
  label: string,
  width = 'w-12',
) {
  const row = document.createElement('div')
  row.className =
    'flex items-baseline justify-between gap-3 border-b border-dashed border-line/80 py-1 last:border-b-0'
  const labelEl = document.createElement('span')
  labelEl.className =
    'font-mono text-[10px] uppercase tracking-[0.06em] text-muted'
  labelEl.textContent = label
  const valueEl = document.createElement('strong')
  valueEl.className = 'font-mono text-[12px]'
  const shimmer = document.createElement('span')
  shimmer.className = `inline-block h-2 align-middle rounded-full bg-line/70 animate-pulse ${width}`
  valueEl.append(shimmer)
  row.append(labelEl, valueEl)
  detail.append(row)
}

function renderGithubSkeleton(detail: HTMLElement) {
  detail.textContent = ''
  appendGithubSkeletonRow(detail, 'contribs', 'w-10')
  appendGithubSkeletonRow(detail, 'LOCs', 'w-16')
  appendGithubSkeletonRow(detail, 'commits / prs / issues', 'w-16')
}

export function renderGithubLoading(rail: Element, date: string) {
  setGithubDetailTitle(rail, date)
  const detail = rail.querySelector<HTMLElement>('[data-github-detail]')
  if (!detail) return
  renderGithubSkeleton(detail)
}

function appendGithubRow(
  detail: HTMLElement,
  label: string,
  value: string,
  tone = 'text-ink',
) {
  const row = document.createElement('div')
  row.className =
    'flex items-baseline justify-between gap-3 border-b border-dashed border-line/80 py-1 last:border-b-0'
  const labelEl = document.createElement('span')
  labelEl.className =
    'font-mono text-[10px] uppercase tracking-[0.06em] text-muted'
  labelEl.textContent = label
  const valueEl = document.createElement('strong')
  valueEl.className = `font-mono text-[12px] ${tone}`
  valueEl.textContent = value
  row.append(labelEl, valueEl)
  detail.append(row)
}

function appendGithubChangedRow(
  detail: HTMLElement,
  additions: number | null | undefined,
  deletions: number | null | undefined,
) {
  const row = document.createElement('div')
  row.className =
    'flex items-baseline justify-between gap-3 border-b border-dashed border-line/80 py-1 last:border-b-0'
  const labelEl = document.createElement('span')
  labelEl.className =
    'font-mono text-[10px] uppercase tracking-[0.06em] text-muted'
  labelEl.textContent = 'LOCs'
  const valueEl = document.createElement('strong')
  valueEl.className = 'font-mono text-[12px]'
  const added = document.createElement('span')
  added.className = 'text-green-600'
  added.textContent = `+${stat(additions)}`
  const sep = document.createTextNode(' / ')
  const removed = document.createElement('span')
  removed.className = 'text-red-600'
  removed.textContent = `-${stat(deletions)}`
  valueEl.append(added, sep, removed)
  row.append(labelEl, valueEl)
  detail.append(row)
}

export function renderGithubDetail(
  rail: Element,
  github: GithubDayPayload | null,
  options: { selectedDate?: string | null; fallbackCount?: number } = {},
) {
  setGithubDetailTitle(rail, options.selectedDate ?? null)
  const detail = rail.querySelector<HTMLElement>('[data-github-detail]')
  if (!detail) return
  detail.textContent = ''

  if (!github || github.ok === false) {
    appendGithubRow(detail, 'status', 'day details unavailable', 'text-muted')
    if (typeof options.fallbackCount === 'number') {
      appendGithubRow(detail, 'contribs', stat(options.fallbackCount))
    }
    appendGithubSkeletonRow(detail, 'LOCs', 'w-16')
    appendGithubSkeletonRow(detail, 'commits / prs / issues', 'w-16')
    return
  }

  const displayedContributions =
    typeof options.fallbackCount === 'number'
      ? options.fallbackCount
      : github.contributions

  appendGithubRow(detail, 'contribs', stat(displayedContributions))
  appendGithubChangedRow(detail, github.additions, github.deletions)
  appendGithubRow(
    detail,
    'commits / prs / issues',
    `${stat(github.commits)} / ${stat(github.pullRequests)} / ${stat(github.issues)}`,
  )
}
