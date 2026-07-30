import { useSyncExternalStore } from 'react'
import { Chessboard } from 'react-chessboard'
import type { MoveReview } from '~/lib/lab/chess-review/types'
import { uciSquares } from './ui'

interface ReviewBoardProps {
  fen: string
  selectedMove: MoveReview | null
  orientation?: 'white' | 'black'
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

export function describeBoardPosition(fen: string) {
  const activeColor = fen.split(' ')[1] === 'b' ? 'Black' : 'White'
  return `Chess position after the selected move. ${activeColor} to move. FEN: ${fen}`
}

export function boardMotionOptions(reducedMotion: boolean) {
  return {
    animationDurationInMs: reducedMotion ? 0 : 180,
    showAnimations: !reducedMotion,
  }
}

export function ReviewBoard({
  fen,
  selectedMove,
  orientation = 'white',
}: ReviewBoardProps) {
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    reducedMotionSnapshot,
    serverReducedMotionSnapshot,
  )
  const moveSquares = selectedMove ? uciSquares(selectedMove.uci) : null
  const options = {
    id: 'chess-review-board',
    position: fen,
    boardOrientation: orientation,
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
    <figure className="relative min-w-0" data-board-orientation={orientation}>
      <figcaption className="sr-only">{describeBoardPosition(fen)}</figcaption>
      <div inert>
        <Chessboard options={options} />
      </div>
    </figure>
  )
}
