import type {
  GameReview,
  PlayerReviewSummary,
} from '~/lib/lab/chess-review/types'

interface GameSummaryProps {
  review: GameReview
}

function playerName(review: GameReview, color: 'white' | 'black'): string {
  const header =
    color === 'white' ? review.game.headers.White : review.game.headers.Black
  return header || (color === 'white' ? 'White' : 'Black')
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
    <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 border-t border-line px-4 py-3 first:border-t-0 sm:px-5">
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
      <div className="flex gap-1.5 font-mono text-[10px]">
        <span
          className="rounded bg-amber-100 px-1.5 py-1 text-amber-700"
          title="Inaccuracies"
        >
          {summary.classifications.inaccuracy}?!
        </span>
        <span
          className="rounded bg-orange-100 px-1.5 py-1 text-orange-700"
          title="Mistakes"
        >
          {summary.classifications.mistake}?
        </span>
        <span
          className="rounded bg-red-100 px-1.5 py-1 text-red-700"
          title="Blunders"
        >
          {summary.classifications.blunder}??
        </span>
      </div>
    </div>
  )
}

export function GameSummary({ review }: GameSummaryProps) {
  const event = review.game.headers.Event
  const result = review.game.headers.Result || '*'
  const resultLabel = result === '*' ? 'Unfinished' : result

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
        <span className="rounded-lg border border-line bg-white px-3 py-1.5 font-mono text-sm font-bold text-ink">
          Result {resultLabel}
        </span>
      </div>
      <PlayerRow name={playerName(review, 'white')} summary={review.white} />
      <PlayerRow name={playerName(review, 'black')} summary={review.black} />
    </section>
  )
}
