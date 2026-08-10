import type { ActivityItem, ActivityPayload } from '~/types/integrations'

const ACTIVITY_COLORS: Record<ActivityItem['type'], string> = {
  book: 'bg-code-amber',
  build: 'bg-code-blue',
  github: 'bg-code-blue',
  movie: 'bg-code-red',
  spotify: 'bg-code-green',
}

function activityCard(item: ActivityItem): HTMLElement {
  // Book/movie cards point to the internal shelf page; everything else
  // (e.g. github) keeps its own external link.
  const isShelf = item.type === 'book' || item.type === 'movie'
  const href = isShelf
    ? item.type === 'book'
      ? '/shelf#reading'
      : '/shelf#watching'
    : item.url
  const wrapper = document.createElement(href ? 'a' : 'div')
  if (href) {
    ;(wrapper as HTMLAnchorElement).href = href
    if (!isShelf) {
      ;(wrapper as HTMLAnchorElement).target = '_blank'
      ;(wrapper as HTMLAnchorElement).rel = 'noreferrer'
    }
  }
  wrapper.className = item.imageUrl
    ? 'grid grid-cols-[40px_1fr] items-center gap-3 rounded-xl border border-line bg-white p-2.5 text-ink no-underline hover:border-code-blue'
    : 'grid grid-cols-[18px_1fr] gap-2.5 rounded-xl border border-line bg-white p-3 text-ink no-underline hover:border-code-blue'

  if (item.imageUrl) {
    const image = document.createElement('img')
    image.src = item.imageUrl
    image.alt = ''
    image.loading = 'lazy'
    // Book/movie covers keep their natural aspect ratio (fixed width, auto
    // height); github (and any other) image stays a 1:1 square.
    image.className = isShelf
      ? 'h-auto w-10 rounded-md border border-line'
      : 'h-10 w-10 rounded-md border border-line object-cover'
    wrapper.append(image)
  } else {
    const dot = document.createElement('span')
    dot.className = `mt-1.5 h-2 w-2 rounded-full ${ACTIVITY_COLORS[item.type] || 'bg-code-blue'}`
    wrapper.append(dot)
  }

  const content = document.createElement('span')
  content.className = 'min-w-0'
  const labelMeta =
    item.type === 'book' || item.type === 'movie' ? item.meta : ''
  if (labelMeta) {
    const label = document.createElement('span')
    label.className =
      'block font-mono text-[10px] uppercase tracking-[0.06em] text-muted'
    label.textContent = labelMeta
    content.append(label)
  }
  const title = document.createElement('strong')
  title.className = 'block font-medium leading-snug'
  title.textContent = item.title
  const subtitle = document.createElement('span')
  subtitle.className =
    'mt-0.5 block truncate text-[13px] leading-snug text-muted'
  subtitle.textContent = item.subtitle || item.meta || item.type
  content.append(title, subtitle)
  wrapper.append(content)
  return wrapper
}

export function updateActivity(
  rail: Element,
  activity: ActivityPayload | null,
) {
  const list = rail.querySelector<HTMLElement>('[data-activity-list]')
  if (!list) return
  list.textContent = ''
  const items = activity?.items?.slice(0, 4) || []
  if (!items.length) {
    const empty = document.createElement('div')
    empty.className =
      'rounded-xl border border-line bg-white p-3 text-[13px] text-muted'
    empty.textContent = 'No recent activity.'
    list.append(empty)
    return
  }
  list.append(...items.map(activityCard))
}
