import {
  CodeSquareIcon,
  ExternalLinkIcon,
  StarIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
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
      <p className="m-0 flex min-w-0 items-center gap-1.5 whitespace-nowrap font-mono text-[10px] leading-relaxed">
        <span className="font-medium text-slate-600">leo@[::1]:443</span>
        <span className="truncate text-slate-400">~/leohuynh.dev</span>
      </p>
      <img
        src="/static/images/leo-huynh-signature.svg"
        alt="Leo Huynh's handwritten signature"
        width={1242}
        height={676}
        loading="lazy"
        decoding="async"
        className="mt-1 h-auto w-20 max-w-full"
      />

      <a
        href={repoUrl}
        target="_blank"
        rel="noreferrer"
        aria-label={repositorySourceLabel(repo, stars)}
        className="group mt-2 grid min-w-0 grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-2 rounded-lg border border-line bg-white p-2 no-underline shadow-[1px_1px_0_var(--color-line)] transition-[transform,border-color,box-shadow] hover:-translate-y-px hover:border-slate-400 hover:shadow-[2px_2px_0_var(--color-line)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        data-umami-event="sidebar-view-repo"
        data-umami-event-source="studio-sidebar"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-md border border-line bg-[#f6f8fa] text-slate-600 transition-colors group-hover:text-ink">
          <HugeiconsIcon
            icon={CodeSquareIcon}
            size={16}
            strokeWidth={1.9}
            aria-hidden="true"
          />
        </span>
        <span className="min-w-0">
          <span className="block text-xs font-semibold leading-tight text-ink">
            Source code
          </span>
          <span className="mt-0.5 block truncate font-mono text-[9px] text-slate-500">
            {repo}
          </span>
          <span className="mt-1 flex items-center gap-1 font-mono text-[10px] leading-none text-slate-500">
            <span className="text-amber-500">
              <HugeiconsIcon
                icon={StarIcon}
                size={12}
                strokeWidth={1.9}
                aria-hidden="true"
              />
            </span>
            {stars === null ? '—' : `${stars.toLocaleString()} stars`}
          </span>
        </span>
        <span className="self-start pt-0.5 text-slate-400 transition-colors group-hover:text-ink">
          <HugeiconsIcon
            icon={ExternalLinkIcon}
            size={13}
            strokeWidth={1.9}
            aria-hidden="true"
          />
        </span>
      </a>
    </div>
  )
}
