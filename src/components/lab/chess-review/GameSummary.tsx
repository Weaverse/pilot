import type {
  GameReview,
  PlayerReviewSummary,
} from '~/lib/lab/chess-review/types'

interface GameSummaryProps {
  review: GameReview
}

interface CountBadgeProps {
  count: number
  singular: string
  plural: string
  tone: string
}

function playerName(review: GameReview, color: 'white' | 'black'): string {
  const header =
    color === 'white' ? review.game.headers.White : review.game.headers.Black
  return header || (color === 'white' ? 'White' : 'Black')
}

function gameOutcome(review: GameReview): {
  label: string
  result: string
} {
  const result = review.game.headers.Result || '*'

  if (result === '1-0') {
    return { label: `Winner · ${playerName(review, 'white')}`, result: '1–0' }
  }
  if (result === '0-1') {
    return { label: `Winner · ${playerName(review, 'black')}`, result: '0–1' }
  }
  if (result === '1/2-1/2') {
    return { label: 'Draw', result: '½–½' }
  }
  if (result === '*') {
    return { label: 'Game unfinished', result: 'No result' }
  }

  return { label: 'Result recorded', result }
}

function CountBadge({ count, singular, plural, tone }: CountBadgeProps) {
  const label = count === 1 ? singular : plural

  return (
    <span
      className={`rounded px-2 py-1 font-mono text-[10px] font-semibold ${tone}`}
    >
      {count} {label}
    </span>
  )
}

function PlayerRow({
  name,
  summary,
}: {
  name: string
  summary: PlayerReviewSummary
}) {
  const critical =
    summary.classifications.inaccuracy +
    summary.classifications.mistake +
    summary.classifications.blunder

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-t border-line px-4 py-3 first:border-t-0 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:px-5">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={`h-3 w-3 shrink-0 rounded-sm border ${
              summary.color === 'white'
                ? 'border-slate-300 bg-white'
                : 'border-slate-800 bg-slate-900'
            }`}
            aria-hidden="true"
          />
          <span className="truncate font-semibold text-ink">{name}</span>
        </div>
        <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-muted">
          {critical} critical · {summary.averageCentipawnLoss} ACPL
        </p>
      </div>
      <div className="text-right">
        <div className="font-mono text-xl font-bold text-ink">
          {summary.accuracy.toFixed(1)}
        </div>
        <div className="font-mono text-[9px] uppercase tracking-wider text-muted">
          accuracy
        </div>
      </div>
      <div className="col-span-2 flex flex-wrap gap-1.5 sm:col-span-1 sm:justify-end">
        <CountBadge
          count={summary.classifications.inaccuracy}
          singular="inaccuracy"
          plural="inaccuracies"
          tone="bg-amber-100 text-amber-800"
        />
        <CountBadge
          count={summary.classifications.mistake}
          singular="mistake"
          plural="mistakes"
          tone="bg-orange-100 text-orange-800"
        />
        <CountBadge
          count={summary.classifications.blunder}
          singular="blunder"
          plural="blunders"
          tone="bg-red-100 text-red-800"
        />
      </div>
    </div>
  )
}

export function GameSummary({ review }: GameSummaryProps) {
  const event = review.game.headers.Event
  const outcome = gameOutcome(review)

  return (
    <section
      className="overflow-hidden rounded-xl border border-line bg-white"
      aria-labelledby="game-summary-title"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 bg-panel2 px-4 py-3 sm:px-5">
        <div>
          <h2 id="game-summary-title" className="font-semibold text-ink">
            Review complete
          </h2>
          <p className="mt-0.5 text-xs text-muted">
            {event || 'Imported game'} · {review.moves.length} plies · local
            estimate
          </p>
        </div>
        <div className="rounded-lg border border-line bg-white px-3 py-2 text-right">
          <p className="text-sm font-bold text-ink">{outcome.label}</p>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-muted">
            Result {outcome.result}
          </p>
        </div>
      </div>
      <PlayerRow name={playerName(review, 'white')} summary={review.white} />
      <PlayerRow name={playerName(review, 'black')} summary={review.black} />
    </section>
  )
}
