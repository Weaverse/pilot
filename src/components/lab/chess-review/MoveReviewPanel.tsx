import type { MoveReview, PositionAnalysis } from '~/lib/lab/chess-review/types'
import { CLASSIFICATION_UI, formatEvaluation } from './ui'

interface MoveReviewPanelProps {
  move: MoveReview | null
  position: PositionAnalysis
}

export function MoveReviewPanel({ move, position }: MoveReviewPanelProps) {
  if (!move) {
    return (
      <section
        className="rounded-xl border border-line bg-white p-5"
        aria-labelledby="move-review-title"
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
          Starting position
        </p>
        <h3 id="move-review-title" className="mt-2 text-xl font-bold text-ink">
          Ready to replay
        </h3>
        <p className="mt-2 text-sm leading-6 text-muted">
          Select a move or use the arrow keys to walk through the engine review.
        </p>
      </section>
    )
  }

  const presentation = CLASSIFICATION_UI[move.classification]
  const loss =
    move.centipawnLoss >= 50_000
      ? 'Mate'
      : `${(move.centipawnLoss / 100).toFixed(1)}`

  return (
    <section
      className="rounded-xl border border-line bg-white p-5"
      aria-labelledby="move-review-title"
      aria-live="polite"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
            Move {move.moveNumber} · {move.color}
          </p>
          <h3
            id="move-review-title"
            className="mt-1 font-mono text-2xl font-bold text-ink"
          >
            {move.san}
          </h3>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-mono text-[11px] font-bold ${presentation.badge}`}
        >
          <span aria-hidden="true">{presentation.glyph}</span>
          {presentation.label}
        </span>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-600">{move.narrative}</p>

      <dl className="mt-5 grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-panel2 px-3 py-2.5">
          <dt className="font-mono text-[9px] uppercase tracking-wider text-muted">
            Eval
          </dt>
          <dd className="mt-1 font-mono text-sm font-bold text-ink">
            {formatEvaluation(move.evaluationAfter)}
          </dd>
        </div>
        <div className="rounded-lg bg-panel2 px-3 py-2.5">
          <dt className="font-mono text-[9px] uppercase tracking-wider text-muted">
            Loss
          </dt>
          <dd className="mt-1 font-mono text-sm font-bold text-ink">{loss}</dd>
        </div>
        <div className="rounded-lg bg-panel2 px-3 py-2.5">
          <dt className="font-mono text-[9px] uppercase tracking-wider text-muted">
            Depth
          </dt>
          <dd className="mt-1 font-mono text-sm font-bold text-ink">
            {position.depth}
          </dd>
        </div>
      </dl>

      {move.principalVariation.length > 0 && (
        <div className="mt-5 border-t border-line pt-4">
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
              {move.uci === move.bestMove ? 'Engine line' : 'Better line'}
            </span>
            {move.uci !== move.bestMove && move.bestMoveSan && (
              <span className="font-mono text-xs font-bold text-emerald-700">
                {move.bestMoveSan}
              </span>
            )}
          </div>
          <p className="mt-2 overflow-x-auto whitespace-nowrap rounded-lg bg-slate-950 px-3 py-2.5 font-mono text-xs text-slate-200">
            {move.principalVariation.join(' ')}
          </p>
        </div>
      )}

      <p className="mt-4 text-[10px] leading-4 text-muted">
        Evaluation is shown from White&rsquo;s perspective. Loss is measured
        against Stockfish&rsquo;s top move.
      </p>
    </section>
  )
}
