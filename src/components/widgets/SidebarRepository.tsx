import { useEffect, useState } from 'react'
import { fetchSiteStats } from '~/lib/stats'
import { repositorySourceLabel } from './repository-link'

interface SidebarRepositoryProps {
  repo: string
  repoUrl: string
}

export default function SidebarRepository({
  repo,
  repoUrl,
}: SidebarRepositoryProps) {
  const [stars, setStars] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadStars() {
      const data = await fetchSiteStats()
      if (!cancelled) setStars(data.ok ? data.stars : null)
    }

    loadStars()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="border-t border-line pt-3">
      <p className="m-0 font-mono text-[10px] leading-relaxed text-slate-500">
        {'/* built by Leo Huynh in Hanoi */'}
      </p>
      <img
        src="/static/images/leo-huynh-signature.svg"
        alt="Leo Huynh's handwritten signature"
        width={1242}
        height={676}
        loading="lazy"
        decoding="async"
        className="mt-1.5 h-auto w-24 max-w-full"
      />

      <a
        href={repoUrl}
        target="_blank"
        rel="noreferrer"
        aria-label={repositorySourceLabel(repo, stars)}
        className="-mx-1 mt-2 flex min-w-0 items-center justify-between gap-2 rounded-lg px-1 py-2 no-underline transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        data-umami-event="sidebar-view-repo"
        data-umami-event-source="studio-sidebar"
      >
        <span className="min-w-0">
          <span className="block text-xs font-semibold text-ink">
            GitHub source <span aria-hidden="true">↗</span>
          </span>
          <span className="mt-0.5 block truncate font-mono text-[10px] text-slate-500">
            {repo}
          </span>
        </span>
        <span className="shrink-0 rounded-full border border-line bg-white px-2 py-1 font-mono text-[10px] text-ink">
          <span aria-hidden="true">★</span>{' '}
          {stars === null ? '—' : stars.toLocaleString()}
        </span>
      </a>
    </div>
  )
}
