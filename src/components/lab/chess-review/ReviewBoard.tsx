import { useSyncExternalStore } from 'react'
import { Chessboard } from 'react-chessboard'
import type { MoveReview } from '~/lib/lab/chess-review/types'
import { CLASSIFICATION_UI, uciSquares } from './ui'

interface ReviewBoardProps {
  fen: string
  selectedMove: MoveReview | null
}

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

function subscribeReducedMotion(onChange: () => void) {
  if (typeof window === 'undefined') return () => undefined
  const query = window.matchMedia(REDUCED_MOTION_QUERY)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

function reducedMotionSnapshot() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia(REDUCED_MOTION_QUERY).matches
  )
}

function serverReducedMotionSnapshot() {
  return false
}

export function boardMotionOptions(reducedMotion: boolean) {
  return {
    animationDurationInMs: reducedMotion ? 0 : 180,
    showAnimations: !reducedMotion,
  }
}

export function ReviewBoard({ fen, selectedMove }: ReviewBoardProps) {
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    reducedMotionSnapshot,
    serverReducedMotionSnapshot,
  )
  const moveSquares = selectedMove ? uciSquares(selectedMove.uci) : null
  const presentation = selectedMove
    ? CLASSIFICATION_UI[selectedMove.classification]
    : null
  const options = {
    id: 'chess-review-board',
    position: fen,
    boardOrientation: 'white' as const,
    allowDragging: false,
    allowDrawingArrows: false,
    showNotation: true,
    ...boardMotionOptions(reducedMotion),
    boardStyle: {
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 20px 48px -28px rgba(15, 23, 42, 0.65)',
    },
    lightSquareStyle: { backgroundColor: '#e7e5d8' },
    darkSquareStyle: { backgroundColor: '#64796a' },
    squareStyles: moveSquares
      ? {
          [moveSquares[0]]: {
            boxShadow: 'inset 0 0 0 999px rgba(250, 204, 21, 0.28)',
          },
          [moveSquares[1]]: {
            boxShadow: 'inset 0 0 0 999px rgba(250, 204, 21, 0.42)',
          },
        }
      : {},
  }

  return (
    <figure className="relative min-w-0 flex-1">
      <figcaption className="sr-only">
        Chess position after the selected move
      </figcaption>
      <div inert>
        <Chessboard options={options} />
      </div>
      {presentation && (
        <span
          className={`pointer-events-none absolute top-2 right-2 flex h-8 min-w-8 items-center justify-center rounded-lg border px-1.5 font-mono text-[11px] font-bold shadow-sm ${presentation.badge}`}
          title={presentation.label}
          aria-hidden="true"
        >
          {presentation.glyph}
        </span>
      )}
    </figure>
  )
}
