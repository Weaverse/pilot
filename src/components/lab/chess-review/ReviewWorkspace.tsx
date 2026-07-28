import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  KeyboardIcon,
  RefreshIcon,
  RotateClockwiseIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react'
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
import { CLASSIFICATION_UI } from './ui'

interface ReviewWorkspaceProps {
  review: GameReview
  onNewReview: () => void
}

interface ToolbarButtonProps {
  id: string
  label: string
  disabled?: boolean
  pressed?: boolean
  onClick: () => void
  children: ReactNode
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
  position,
}: {
  name: string
  color: 'white' | 'black'
  position: 'top' | 'bottom'
}) {
  return (
    <div
      className="flex min-w-0 items-center justify-between gap-3 py-2.5"
      data-board-player={position}
      data-player-color={color}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <span
          className={`h-3.5 w-3.5 shrink-0 rounded-sm border ${
            color === 'white'
              ? 'border-slate-300 bg-white shadow-sm'
              : 'border-slate-900 bg-slate-900'
          }`}
          aria-hidden="true"
        />
        <span className="truncate text-sm font-semibold text-ink">{name}</span>
      </div>
      <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
        {color}
      </span>
    </div>
  )
}

function ToolbarButton({
  id,
  label,
  disabled = false,
  pressed,
  onClick,
  children,
}: ToolbarButtonProps) {
  const tooltipId = `chess-review-tooltip-${id}`

  return (
    <span className="group relative inline-flex">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        aria-describedby={tooltipId}
        aria-pressed={pressed}
        className="chess-review-nav-button"
        data-toolbar-action={id}
      >
        {children}
      </button>
      <span
        id={tooltipId}
        role="tooltip"
        className="pointer-events-none absolute top-full left-1/2 z-30 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-950 px-2 py-1 font-mono text-[10px] font-semibold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 motion-reduce:transition-none"
      >
        {label}
      </span>
    </span>
  )
}

export function ReviewWorkspace({ review, onNewReview }: ReviewWorkspaceProps) {
  const maxPly = review.moves.length
  const initialPly = review.turningPointPly ?? Math.min(1, maxPly)
  const [selectedPly, setSelectedPly] = useState(initialPly)
  const [orientation, setOrientation] = useState<'white' | 'black'>('white')
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
  const topPlayer =
    orientation === 'white'
      ? { name: blackName, color: 'black' as const }
      : { name: whiteName, color: 'white' as const }
  const bottomPlayer =
    orientation === 'white'
      ? { name: whiteName, color: 'white' as const }
      : { name: blackName, color: 'black' as const }

  function select(ply: number) {
    setSelectedPly(clampPly(ply, maxPly))
  }

  function flipBoard() {
    setOrientation((current) => (current === 'white' ? 'black' : 'white'))
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
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {selectedMove
          ? `Move ${selectedMove.moveNumber} ${selectedMove.color}, ${selectedMove.san}, ${CLASSIFICATION_UI[selectedMove.classification].label}`
          : 'Starting position'}
      </p>
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
          <div className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-x-2 sm:grid-cols-[2rem_minmax(0,1fr)] sm:gap-x-3">
            <div className="col-start-2 row-start-1">
              <PlayerLabel
                name={topPlayer.name}
                color={topPlayer.color}
                position="top"
              />
            </div>
            <div className="col-start-1 row-start-2 min-h-0">
              <EvaluationBar
                evaluation={evaluation}
                orientation={orientation}
              />
            </div>
            <div className="col-start-2 row-start-2 min-w-0">
              <ReviewBoard
                fen={selectedPosition.fen}
                selectedMove={selectedMove}
                orientation={orientation}
              />
            </div>
            <div className="col-start-2 row-start-3">
              <PlayerLabel
                name={bottomPlayer.name}
                color={bottomPlayer.color}
                position="bottom"
              />
            </div>

            <nav
              className="col-start-2 row-start-4 mt-1 flex items-center justify-center gap-1.5"
              aria-label="Move navigation"
            >
              <ToolbarButton
                id="start"
                label="Starting position"
                onClick={() => select(0)}
                disabled={selectedPly === 0}
              >
                <span aria-hidden="true">|‹</span>
              </ToolbarButton>
              <ToolbarButton
                id="previous"
                label="Previous move"
                onClick={() => select(selectedPly - 1)}
                disabled={selectedPly === 0}
              >
                <HugeiconsIcon
                  icon={ArrowLeft01Icon}
                  size={17}
                  strokeWidth={1.9}
                />
              </ToolbarButton>
              <span className="min-w-16 text-center font-mono text-xs text-muted">
                {selectedPly === 0 ? 'Start' : `${selectedPly} / ${maxPly}`}
              </span>
              <ToolbarButton
                id="next"
                label="Next move"
                onClick={() => select(selectedPly + 1)}
                disabled={selectedPly === maxPly}
              >
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  size={17}
                  strokeWidth={1.9}
                />
              </ToolbarButton>
              <ToolbarButton
                id="final"
                label="Final position"
                onClick={() => select(maxPly)}
                disabled={selectedPly === maxPly}
              >
                <span aria-hidden="true">›|</span>
              </ToolbarButton>
              <ToolbarButton
                id="flip"
                label="Flip board"
                onClick={flipBoard}
                pressed={orientation === 'black'}
              >
                <HugeiconsIcon
                  icon={RotateClockwiseIcon}
                  size={17}
                  strokeWidth={1.9}
                />
              </ToolbarButton>
            </nav>

            <p className="col-start-2 row-start-5 mt-3 flex items-center justify-center gap-2 text-center font-mono text-[10px] text-muted">
              <HugeiconsIcon icon={KeyboardIcon} size={13} strokeWidth={1.8} />
              Arrow keys · Home · End
            </p>
          </div>
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
