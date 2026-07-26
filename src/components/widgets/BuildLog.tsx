import { type ReactNode, useEffect, useState } from 'react'
import { fetchSiteStats, SITE_STATS_REFRESH_INTERVAL_MS } from '~/lib/stats'
import type { SiteStatsPayload } from '~/types/integrations'
import { repositorySourceLabel } from './repository-link'

interface BuildLogProps {
  /** Build-time facts: site config + a filesystem glob. */
  site: string
  description: string
  repo: string
  repoUrl: string
  loc: number
  files: number
  stack: string[]
}

/** GitHub-light syntax palette, matching the site's Expressive Code light theme. */
function Key({ name }: { name: string }) {
  return <span className="text-[#0550ae]">"{name}"</span>
}
function Str({ children }: { children: ReactNode }) {
  return <span className="text-[#116329]">"{children}"</span>
}
function Num({ value }: { value: number | null }) {
  // Live fields render `…` until the fetch resolves (or stay `…` if unavailable).
  return (
    <span className="text-[#8250df]">
      {value === null ? '…' : value.toLocaleString()}
    </span>
  )
}
function P({ children }: { children: ReactNode }) {
  return <span className="text-slate-500">{children}</span>
}

/**
 * Home page "build log": a lean JSON `site.json` manifest in a light, self-framed code block.
 * Deliberately only carries facts NOT already shown elsewhere on the page (the rail shows
 * spotify/github/activity, the footer shows branch/commit/clock) — so it stays a codebase +
 * traffic snapshot. Build-time facts (repo, LOC, files, stack) arrive as props; live numbers
 * (commits, stars, all-time + last-24h hits/visitors, reactions) hydrate from
 * `/api/site-stats.json` and poll ~30s, rendering `…` until resolved. The header shows a live
 * `● N online` badge (hidden when zero/unavailable).
 */
export default function BuildLog({
  site,
  description,
  repo,
  repoUrl,
  loc,
  files,
  stack,
}: BuildLogProps) {
  const [live, setLive] = useState<SiteStatsPayload | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const data = await fetchSiteStats()
      if (!cancelled) setLive(data)
    }

    load()
    const id = setInterval(load, SITE_STATS_REFRESH_INTERVAL_MS)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  const ok = live?.ok ? live : null
  const stars = ok?.stars ?? null

  return (
    <figure className="m-0 overflow-hidden rounded-xl border border-line bg-white shadow-[3px_3px_0_var(--color-line)]">
      <figcaption className="flex items-center justify-between gap-3 border-b border-line bg-white px-3 py-1.75 font-mono text-[11px] text-muted">
        <span className="inline-flex items-center gap-2">
          <span className="inline-flex gap-1" aria-hidden="true">
            <span className="h-2 w-2 rounded-full bg-[#f87171]" />
            <span className="h-2 w-2 rounded-full bg-[#fbbf24]" />
            <span className="h-2 w-2 rounded-full bg-[#34d399]" />
          </span>
          site.json
        </span>
        {ok?.online ? (
          <span className="inline-flex items-center gap-1.5 text-[#116329]">
            <span className="relative flex h-1.75 w-1.75">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#34d399] opacity-75" />
              <span className="relative inline-flex h-1.75 w-1.75 rounded-full bg-[#34d399]" />
            </span>
            {ok.online.toLocaleString()} online
          </span>
        ) : null}
      </figcaption>
      <pre
        className="m-0 overflow-auto px-4.5 py-4 text-[13px] leading-[1.75] text-[#1f2328]"
        style={{ background: '#f6f8fa', fontFamily: 'var(--code-font-family)' }}
      >
        <code>
          <span className="text-slate-400">
            {'// live · /api/site-stats.json + build-time'}
          </span>
          {'\n'}
          <P>{'{'}</P>
          {'\n  '}
          <Key name="site" />
          <P>: </P>
          <Str>{site}</Str>
          <P>,</P>
          {'\n  '}
          <Key name="description" />
          <P>: </P>
          <Str>{description}</Str>
          <P>,</P>
          {'\n  '}
          <Key name="stack" />
          <P>: [</P>
          {stack.map((tech, i) => (
            <span key={tech}>
              <Str>{tech}</Str>
              {i < stack.length - 1 && <P>, </P>}
            </span>
          ))}
          <P>],</P>
          {'\n  '}
          <Key name="git" />
          <P>: {'{'}</P>
          {'\n    '}
          <Key name="repo" />
          <P>: </P>
          <a
            href={repoUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={repositorySourceLabel(repo, stars)}
            className="rounded-sm underline decoration-line underline-offset-[3px] hover:decoration-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            data-umami-event="build-log-view-repo"
            data-umami-event-target="repo"
          >
            <Str>{repo}</Str>
          </a>
          <P>,</P>
          {'\n    '}
          <Key name="loc" />
          <P>: </P>
          <Num value={loc} />
          <P>, </P>
          <Key name="files" />
          <P>: </P>
          <Num value={files} />
          <P>, </P>
          <Key name="commits" />
          <P>: </P>
          <Num value={ok?.commits ?? null} />
          <P>, </P>
          <Key name="stars" />
          <P>: </P>
          <a
            href={repoUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={repositorySourceLabel(repo, stars)}
            className="rounded-sm no-underline hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            data-umami-event="build-log-view-repo"
            data-umami-event-target="stars"
          >
            <Num value={stars} />
          </a>
          {'\n  '}
          <P>{'}'},</P>
          {'\n  '}
          <Key name="stats" />
          <P>: {'{'}</P>
          {'\n    '}
          <Key name="allTime" />
          <P>: {'{ '}</P>
          <Key name="hits" />
          <P>: </P>
          <Num value={ok?.hits ?? null} />
          <P>, </P>
          <Key name="visitors" />
          <P>: </P>
          <Num value={ok?.visitors ?? null} />
          <P>, </P>
          <Key name="reactions" />
          <P>: </P>
          <Num value={ok?.reactions ?? null} />
          <P>{' }'},</P>
          {'\n    '}
          <Key name="last24h" />
          <P>: {'{ '}</P>
          <Key name="hits" />
          <P>: </P>
          <Num value={ok?.hits24h ?? null} />
          <P>, </P>
          <Key name="visitors" />
          <P>: </P>
          <Num value={ok?.visitors24h ?? null} />
          <P>{' }'}</P>
          {'\n  '}
          <P>{'}'}</P>
          {'\n'}
          <P>{'}'}</P>
        </code>
      </pre>
    </figure>
  )
}
