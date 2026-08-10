import type {
  GithubDayPayload,
  GithubStreakPayload,
  GithubTodayPayload,
} from '~/types/integrations'
import { fetchRuntimeJson } from '../shared'
import { renderGithubDetail, renderGithubLoading } from './detail'
import {
  contributionLabel,
  formatGithubDate,
  githubState,
  heatClass,
  readGithubDayCache,
  writeGithubDayCache,
} from './state'

function renderGithubHeat(rail: Element, streak: GithubStreakPayload | null) {
  const heat = rail.querySelector<HTMLElement>('[data-github-heat]')
  if (!heat) return
  heat.textContent = ''

  const days = streak?.heatmap?.slice(-28) ?? []
  if (!days.length) {
    Array.from({ length: 28 }).forEach(() => {
      const square = document.createElement('span')
      square.className =
        'aspect-square w-full rounded-[3px] border border-line bg-[#eef3f7]'
      heat.append(square)
    })
    return
  }

  days.forEach((day) => {
    const square = document.createElement('button')
    const isSelected = githubState.selectedDate === day.date
    square.type = 'button'
    square.dataset.githubDay = day.date
    square.dataset.githubCount = String(day.contributionCount)
    square.title = `${formatGithubDate(day.date)} — ${contributionLabel(day.contributionCount)}`
    square.setAttribute('aria-label', square.title)
    square.setAttribute('aria-pressed', String(isSelected))
    square.className = [
      'aspect-square w-full rounded-[3px] border cursor-pointer transition focus:outline-none hover:ring-1 hover:ring-code-blue hover:ring-offset-1',
      heatClass(day),
      isSelected ? 'ring-2 ring-code-blue ring-offset-1' : '',
    ]
      .filter(Boolean)
      .join(' ')
    heat.append(square)
  })
}

function syncGithubSelectedState(rail: Element) {
  rail
    .querySelectorAll<HTMLButtonElement>('[data-github-day]')
    .forEach((square) => {
      const selected = square.dataset.githubDay === githubState.selectedDate
      square.setAttribute('aria-pressed', String(selected))
      square.classList.toggle('ring-2', selected)
      square.classList.toggle('ring-code-blue', selected)
      square.classList.toggle('ring-offset-1', selected)
    })
}

async function selectGithubDay(rail: Element, date: string, count?: number) {
  if (githubState.selectedDate === date) {
    githubState.selectedDate = null
    githubState.dayAbort?.abort()
    syncGithubSelectedState(rail)
    renderGithubDetail(rail, githubState.todayPayload)
    return
  }

  githubState.selectedDate = date
  syncGithubSelectedState(rail)

  if (date === githubState.todayPayload?.date) {
    renderGithubDetail(rail, githubState.todayPayload, { selectedDate: date })
    return
  }

  const cached = readGithubDayCache(date)
  if (cached) {
    renderGithubDetail(rail, cached, {
      selectedDate: date,
      fallbackCount: count,
    })
    return
  }

  githubState.dayAbort?.abort()
  githubState.dayAbort = new AbortController()
  renderGithubLoading(rail, date)

  const detail = await fetchRuntimeJson<GithubDayPayload>(
    `/api/github-day.json?date=${encodeURIComponent(date)}`,
    { signal: githubState.dayAbort.signal },
  )
  if (githubState.selectedDate !== date) return

  if (detail) writeGithubDayCache(detail)
  renderGithubDetail(rail, detail, { selectedDate: date, fallbackCount: count })
}

function bindGithubInteractions(rail: Element) {
  const heat = rail.querySelector<HTMLElement>('[data-github-heat]')
  if (heat && !heat.dataset.bound) {
    heat.dataset.bound = 'true'
    heat.addEventListener('click', (event) => {
      const target = event.target as HTMLElement
      const square = target.closest(
        '[data-github-day]',
      ) as HTMLButtonElement | null
      const date = square?.dataset.githubDay
      if (!date) return
      const count = Number(square.dataset.githubCount)
      selectGithubDay(rail, date, Number.isFinite(count) ? count : undefined)
    })
  }

  const clear = rail.querySelector<HTMLButtonElement>('[data-github-clear]')
  if (clear && !clear.dataset.bound) {
    clear.dataset.bound = 'true'
    clear.addEventListener('click', () => {
      githubState.selectedDate = null
      githubState.dayAbort?.abort()
      syncGithubSelectedState(rail)
      renderGithubDetail(rail, githubState.todayPayload)
    })
  }
}

export function updateGithub(
  rail: Element,
  streak: GithubStreakPayload | null,
  today: GithubTodayPayload | null,
) {
  if (streak) {
    renderGithubHeat(rail, streak)
    bindGithubInteractions(rail)
  }

  if (today) {
    githubState.todayPayload = today
    writeGithubDayCache(today)
    if (!githubState.selectedDate) {
      renderGithubDetail(rail, today)
    }
  }
}
