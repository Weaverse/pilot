import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  KeyboardIcon,
  RefreshIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { type KeyboardEvent, useEffect, useRef, useState } from 'react'
import {
  scoreFromWhitePerspective,
  scoreToCentipawns,
  turnFromFen,
} from '~/lib/lab/chess-review/score'
import type { GameReview } from '~/lib/lab/chess-review/types'
import { EvaluationBar } from './EvaluationBar'
import { GameSummary } from './GameSummary'
import { MoveList } from './MoveList'
import { MoveReviewPanel } from './MoveReviewPanel'
import { clampPly, isReviewNavigationKey, navigatePly } from './navigation'
import { ReviewBoard } from './ReviewBoard'

interface ReviewWorkspaceProps {
  review: GameReview
  onNewReview: () => void
}

function isTypingTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    (target instanceof HTMLElement && target.isContentEditable)
  )
}

function PlayerLabel({
  name,
  color,
}: {
  name: string
  color: 'white' | 'black'
}) {
  return (
    <div className="flex items-center gap-2 py-2 font-mono text-xs text-slate-600">
      <span
        className={`h-3 w-3 rounded-sm border ${
          color === 'white'
            ? 'border-slate-300 bg-white'
            : 'border-slate-900 bg-slate-900'
        }`}
        aria-hidden="true"
      />
      <span className="truncate">{name}</span>
    </div>
  )
}

export function ReviewWorkspace({ review, onNewReview }: ReviewWorkspaceProps) {
  const maxPly = review.moves.length
  const initialPly = review.turningPointPly ?? Math.min(1, maxPly)
  const [selectedPly, setSelectedPly] = useState(initialPly)
  const workspaceRef = useRef<HTMLElement>(null)
  const selectedMove = selectedPly > 0 ? review.moves[selectedPly - 1] : null
  const selectedPosition = review.positions[selectedPly]
  const evaluation = selectedMove
    ? selectedMove.evaluationAfter
    : scoreToCentipawns(
        scoreFromWhitePerspective(
          selectedPosition.score,
          turnFromFen(selectedPosition.fen),
        ),
      )
  const whiteName = review.game.headers.White || 'White'
  const blackName = review.game.headers.Black || 'Black'

  function select(ply: number) {
    setSelectedPly(clampPly(ply, maxPly))
  }

  function onWorkspaceKey(event: KeyboardEvent<HTMLElement>) {
    const key = event.key
    if (
      isTypingTarget(event.target) ||
      event.altKey ||
      event.metaKey ||
      event.ctrlKey ||
      !isReviewNavigationKey(key)
    )
      return

    event.preventDefault()
    setSelectedPly((ply) => navigatePly(ply, key, maxPly))
  }

  useEffect(() => {
    workspaceRef.current?.focus({ preventScroll: true })
  }, [])

  return (
    <section
      ref={workspaceRef}
      className="chess-review-root"
      aria-label="Chess review workspace"
      aria-keyshortcuts="ArrowLeft ArrowRight Home End"
      tabIndex={-1}
      onKeyDown={onWorkspaceKey}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-700">
            Stockfish · local review
          </p>
          <h2 className="mt-1 text-2xl font-bold text-ink">
            Your game, move by move
          </h2>
        </div>
        <button
          type="button"
          onClick={onNewReview}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-sm font-semibold text-ink transition-colors hover:border-slate-400"
        >
          <HugeiconsIcon icon={RefreshIcon} size={15} strokeWidth={1.8} />
          New review
        </button>
      </div>

      <GameSummary review={review} />

      <div className="chess-review-workspace mt-5">
        <div className="chess-review-board-column">
          <PlayerLabel name={blackName} color="black" />
          <div className="flex aspect-[calc(1+1/8)] min-w-0 gap-2 sm:gap-3">
            <EvaluationBar evaluation={evaluation} />
            <ReviewBoard
              fen={selectedPosition.fen}
              selectedMove={selectedMove}
            />
          </div>
          <PlayerLabel name={whiteName} color="white" />

          <nav
            className="mt-2 flex items-center justify-center gap-1.5"
            aria-label="Move navigation"
          >
            <button
              type="button"
              onClick={() => select(0)}
              disabled={selectedPly === 0}
              className="chess-review-nav-button"
              aria-label="Starting position"
            >
              <span aria-hidden="true">|‹</span>
            </button>
            <button
              type="button"
              onClick={() => select(selectedPly - 1)}
              disabled={selectedPly === 0}
              className="chess-review-nav-button"
              aria-label="Previous move"
            >
              <HugeiconsIcon
                icon={ArrowLeft01Icon}
                size={17}
                strokeWidth={1.9}
              />
            </button>
            <span className="min-w-22 text-center font-mono text-xs text-muted">
              {selectedPly === 0 ? 'Start' : `${selectedPly} / ${maxPly}`}
            </span>
            <button
              type="button"
              onClick={() => select(selectedPly + 1)}
              disabled={selectedPly === maxPly}
              className="chess-review-nav-button"
              aria-label="Next move"
            >
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                size={17}
                strokeWidth={1.9}
              />
            </button>
            <button
              type="button"
              onClick={() => select(maxPly)}
              disabled={selectedPly === maxPly}
              className="chess-review-nav-button"
              aria-label="Final position"
            >
              <span aria-hidden="true">›|</span>
            </button>
          </nav>

          <p className="mt-3 flex items-center justify-center gap-2 text-center font-mono text-[10px] text-muted">
            <HugeiconsIcon icon={KeyboardIcon} size={13} strokeWidth={1.8} />
            Arrow keys · Home · End
          </p>
        </div>

        <div className="chess-review-side-column">
          <MoveReviewPanel
            move={selectedMove}
            position={review.positions[Math.max(0, selectedPly - 1)]}
          />
          <MoveList
            moves={review.moves}
            selectedPly={selectedPly}
            onSelect={select}
          />
        </div>
      </div>

      <p className="mt-6 text-center text-[10px] leading-4 text-muted">
        Labels and accuracy are deterministic local estimates built from
        Stockfish evaluations—not Chess.com ratings.
      </p>
    </section>
  )
}
