import { TerminalIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useEffect, useState } from 'react'
import { fetchSiteStats } from '~/lib/stats'
import { repositorySourceLabel } from './repository-link'

interface StatusRepositoryProps {
  repo: string
  repoUrl: string
}

export default function StatusRepository({
  repo,
  repoUrl,
}: StatusRepositoryProps) {
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
    <div className="flex min-w-0 items-center gap-1 whitespace-nowrap text-[11px]">
      <span className="shrink-0 text-slate-400" aria-hidden="true">
        <HugeiconsIcon icon={TerminalIcon} size={13} strokeWidth={1.9} />
      </span>
      <span className="hidden shrink-0 text-slate-500 lg:inline">
        leo@[::1]:443
      </span>
      <span className="flex min-w-0 items-center">
        <span className="shrink-0 text-slate-500">~/</span>
        <a
          href={repoUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={repositorySourceLabel(repo, stars)}
          className="min-w-0 truncate text-slate-950 underline decoration-slate-300 underline-offset-3 hover:decoration-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          data-umami-event="statusbar-view-repo"
          data-umami-event-source="studio-statusbar"
        >
          {repo}
        </a>
      </span>
      <span className="hidden shrink-0 text-slate-400 lg:inline">
        (stargazers: {stars === null ? '—' : stars.toLocaleString()})
      </span>
    </div>
  )
}
