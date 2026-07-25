import { useEffect, useState } from 'react'
import { fetchSiteStats, SITE_STATS_REFRESH_INTERVAL_MS } from '~/lib/stats'
import { repositorySourceLabel } from './repository-link'

interface HomeSourceFooterProps {
  repo: string
  repoUrl: string
}

export default function HomeSourceFooter({
  repo,
  repoUrl,
}: HomeSourceFooterProps) {
  const [stars, setStars] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadStars() {
      const data = await fetchSiteStats()
      if (!cancelled) setStars(data.stars)
    }

    loadStars()
    const id = setInterval(loadStars, SITE_STATS_REFRESH_INTERVAL_MS)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  return (
    <footer className="mt-1 grid gap-6 border-t border-line pt-8 sm:grid-cols-[minmax(0,1fr)_minmax(250px,auto)] sm:items-end">
      <div className="min-w-0">
        <p className="m-0 font-mono text-[11px] text-muted">
          {'/* built by Leo Huynh in Hanoi */'}
        </p>
        <img
          src="/static/images/leo-huynh-signature.svg"
          alt="Leo Huynh's handwritten signature"
          width={1242}
          height={676}
          loading="lazy"
          decoding="async"
          className="mt-2.5 h-auto w-42 max-w-full"
        />
      </div>

      <a
        href={repoUrl}
        target="_blank"
        rel="noreferrer"
        aria-label={repositorySourceLabel(repo, stars)}
        className="group flex min-w-0 items-center justify-between gap-5 rounded-xl border border-line bg-white px-4 py-3 no-underline shadow-[2px_2px_0_var(--color-line)] transition-[transform,box-shadow] hover:-translate-y-px hover:shadow-[3px_3px_0_var(--color-line)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        data-umami-event="homepage-view-repo"
        data-umami-event-source="closing-block"
      >
        <span className="min-w-0">
          <span className="block text-sm font-medium text-ink">
            View source on GitHub <span aria-hidden="true">↗</span>
          </span>
          <span className="mt-0.5 block truncate font-mono text-[11px] text-muted">
            {repo}
          </span>
        </span>
        <span className="shrink-0 rounded-full border border-line bg-[#f6f8fa] px-2.5 py-1 font-mono text-[11px] text-ink">
          <span aria-hidden="true">★</span>{' '}
          {stars === null ? '—' : stars.toLocaleString()}
        </span>
      </a>
    </footer>
  )
}
