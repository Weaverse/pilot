import { useEffect, useRef, useState } from 'react'
import { emojiCodepoint } from '~/lib/emoji'
import { fetchStats, postStats } from '~/lib/stats'
import type { ReactionKey, StatsType } from '~/types/stats'

const MAX_REACTIONS = 10

const REACTIONS: Array<{ emoji: string; key: ReactionKey; label: string }> = [
  { emoji: 'sparkling-heart', key: 'loves', label: 'love' },
  { emoji: 'clapping-hands', key: 'applauses', label: 'applause' },
  { emoji: 'bullseye', key: 'bullseyes', label: 'bullseye' },
  { emoji: 'light-bulb', key: 'ideas', label: 'idea' },
]

type Counts = Record<ReactionKey, number>

const EMPTY_COUNTS: Counts = { loves: 0, applauses: 0, ideas: 0, bullseyes: 0 }

function readLocal(storageKey: string): Counts {
  try {
    const data = JSON.parse(localStorage.getItem(storageKey) || '{}')
    return {
      loves: data.loves || 0,
      applauses: data.applauses || 0,
      ideas: data.ideas || 0,
      bullseyes: data.bullseyes || 0,
    }
  } catch {
    return { ...EMPTY_COUNTS }
  }
}

export default function Reactions({
  type,
  slug,
}: {
  type: StatsType
  slug: string
}) {
  const storageKey = `${type}/${slug}`
  const [base, setBase] = useState<Counts | null>(null)
  const [local, setLocal] = useState<Counts>({ ...EMPTY_COUNTS })
  const initialRef = useRef<Counts>({ ...EMPTY_COUNTS })

  useEffect(() => {
    const stored = readLocal(storageKey)
    initialRef.current = stored
    setLocal(stored)

    let cancelled = false
    fetchStats(type, slug).then((stats) => {
      if (cancelled || !stats) return
      setBase({
        loves: stats.loves,
        applauses: stats.applauses,
        ideas: stats.ideas,
        bullseyes: stats.bullseyes,
      })
    })
    return () => {
      cancelled = true
    }
  }, [type, slug, storageKey])

  function save(key: ReactionKey, nextLocal: Counts) {
    localStorage.setItem(storageKey, JSON.stringify(nextLocal))
    const baseCount = base?.[key] ?? 0
    const delta = nextLocal[key] - initialRef.current[key]
    postStats({ type, slug, [key]: baseCount + delta })
  }

  return (
    <div className="flex items-center gap-6">
      {REACTIONS.map(({ key, emoji, label }) => {
        const baseCount = base?.[key] ?? 0
        const display = baseCount + (local[key] - initialRef.current[key])
        const value = base === null && local[key] === 0 ? '--' : display
        return (
          <Reaction
            key={key}
            path={storageKey}
            emoji={emoji}
            label={label}
            reactionKey={key}
            value={value}
            reactions={local[key]}
            onReact={(nextValue) =>
              setLocal((prev) => {
                const next = { ...prev, [key]: nextValue }
                localStorage.setItem(storageKey, JSON.stringify(next))
                return next
              })
            }
            onSave={(nextValue) => save(key, { ...local, [key]: nextValue })}
          />
        )
      })}
    </div>
  )
}

function Reaction({
  path,
  emoji,
  label,
  reactionKey,
  value,
  reactions,
  onReact,
  onSave,
}: {
  path: string
  emoji: string
  label: string
  reactionKey: ReactionKey
  value: string | number
  reactions: number
  onReact: (v: number) => void
  onSave: (v: number) => void
}) {
  const [reacting, setReacting] = useState(false)
  const codepoint = emojiCodepoint(emoji)
  const emojiText = emoji.replace(/-/g, ' ')
  const latestReactions = useRef(reactions)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const countRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    latestReactions.current = reactions
  }, [reactions])

  function handleReact() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setReacting(true)

    if (reactions >= MAX_REACTIONS) {
      countRef.current?.classList.add('animate-scale-up')
      setTimeout(
        () => countRef.current?.classList.remove('animate-scale-up'),
        150,
      )
      return
    }

    const next = reactions + 1
    latestReactions.current = next
    onReact(next)
  }

  function handleMouseLeave() {
    if (!reacting) return
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      setReacting(false)
      onSave(latestReactions.current)
    }, 1000)
  }

  return (
    <button
      type="button"
      onClick={handleReact}
      onMouseLeave={handleMouseLeave}
      aria-label={`React with ${label}`}
      className="relative flex cursor-pointer flex-col items-center justify-center gap-1.5"
      data-umami-event="post-reaction"
      data-umami-event-post={path}
      data-umami-event-react={reactionKey}
    >
      {codepoint ? (
        <img
          src={`/static/twemoji/${codepoint}.svg`}
          alt={emojiText}
          title={emojiText}
          loading="lazy"
          decoding="async"
          className="twemoji inline-block h-[2em] w-[2em] align-[-0.15em]"
        />
      ) : null}
      <span className="relative h-6 w-8 overflow-hidden text-center font-mono text-xs">
        <span
          className={[
            'absolute inset-0 font-semibold text-slate-600 transition-all',
            reacting ? '-translate-y-6 opacity-0' : 'translate-y-0 opacity-100',
          ].join(' ')}
        >
          {value}
        </span>
        <span
          ref={countRef}
          className={[
            'absolute inset-0 text-slate-500 transition-all',
            reacting ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0',
          ].join(' ')}
        >
          +{reactions}
        </span>
      </span>
    </button>
  )
}
