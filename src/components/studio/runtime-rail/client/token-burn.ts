import {
  formatApproxUsd,
  formatTokens,
  INLINE_MODEL_ICONS,
  modelBrandIcon,
  shortModelName,
} from '~/lib/runtime/llm-format'
import type {
  TokenBurnModelSlice,
  TokenBurnPayload,
  TokenBurnWindow,
} from '~/types/integrations'

function tokenBurnWindowLabel(
  window: TokenBurnWindow | null | undefined,
): string {
  const sessions = window?.sessions ?? 0
  return `${formatTokens(window?.tokens)} · ${sessions.toLocaleString()} sess · ${formatApproxUsd(window?.cost)}`
}

function renderTokenBurnModels(
  rail: Element,
  models: TokenBurnModelSlice[] | undefined,
) {
  const list = rail.querySelector<HTMLElement>('[data-tb-models]')
  if (!list) return
  list.textContent = ''

  if (!models?.length) {
    const empty = document.createElement('span')
    empty.className = 'font-mono text-[12px] text-muted'
    empty.textContent = '—'
    list.append(empty)
    return
  }

  const buildRow = (model: TokenBurnModelSlice) => {
    const row = document.createElement('div')
    row.className = 'flex items-center justify-between gap-2 py-0.5'

    const left = document.createElement('span')
    left.className = 'flex min-w-0 items-center gap-1.5'
    const brand = modelBrandIcon(model.model)
    if (brand?.type === 'cdn') {
      const icon = document.createElement('img')
      icon.src = `https://cdn.simpleicons.org/${brand.slug}`
      icon.alt = ''
      icon.loading = 'lazy'
      icon.className = 'h-3.5 w-3.5 shrink-0'
      // Hide gracefully if the slug 404s.
      icon.addEventListener('error', () => icon.remove())
      left.append(icon)
    } else if (brand?.type === 'inline') {
      const icon = document.createElement('span')
      icon.className =
        'inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center text-ink'
      icon.innerHTML = INLINE_MODEL_ICONS[brand.key] ?? ''
      left.append(icon)
    }
    const name = document.createElement('span')
    name.className = 'truncate font-mono text-[12px] text-ink'
    name.textContent = shortModelName(model.model)
    left.append(name)

    const value = document.createElement('strong')
    value.className = 'shrink-0 font-mono text-[11px] text-muted'
    value.textContent = `${formatTokens(model.tokens)} · ${formatApproxUsd(model.cost)}`

    row.append(left, value)
    return row
  }

  const VISIBLE_MODELS = 2
  models.slice(0, VISIBLE_MODELS).forEach((model) => {
    list.append(buildRow(model))
  })

  const rest = models.slice(VISIBLE_MODELS)
  if (!rest.length) return

  const toggle = document.createElement('button')
  toggle.type = 'button'
  toggle.className =
    'mt-0.5 self-start font-mono text-[10px] uppercase tracking-[0.06em] text-muted transition-colors hover:text-ink'

  let expanded = false
  const restRows: HTMLElement[] = []
  const syncToggle = () => {
    toggle.textContent = expanded ? 'show less' : `+${rest.length} more`
  }
  toggle.addEventListener('click', () => {
    expanded = !expanded
    if (expanded) {
      rest.forEach((model) => {
        const row = buildRow(model)
        restRows.push(row)
        list.insertBefore(row, toggle)
      })
    } else {
      restRows.forEach((row) => {
        row.remove()
      })
      restRows.length = 0
    }
    syncToggle()
  })
  syncToggle()
  list.append(toggle)
}

export function updateTokenBurn(rail: Element, tb: TokenBurnPayload | null) {
  const set = (selector: string, text: string) => {
    const el = rail.querySelector<HTMLElement>(selector)
    if (el) el.textContent = text
  }

  if (!tb || tb.ok === false) {
    set('[data-tb-alltime-tokens]', '—')
    set('[data-tb-alltime-sub]', 'unavailable')
    set('[data-tb-today]', '—')
    renderTokenBurnModels(rail, [])
    return
  }

  set(
    '[data-tb-alltime-tokens]',
    `${(tb.allTime?.tokens ?? 0).toLocaleString()}`,
  )
  set(
    '[data-tb-alltime-sub]',
    `${(tb.allTime?.sessions ?? 0).toLocaleString()} sessions · ${formatApproxUsd(tb.allTime?.cost)}`,
  )
  set('[data-tb-today]', tokenBurnWindowLabel(tb.today))
  renderTokenBurnModels(rail, tb.topModels)
}
