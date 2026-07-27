import { scoreToCentipawns } from './score'
import type { EngineScore, MoveClassification } from './types'

export interface MoveClassificationInput {
  playedMove: string
  bestMove: string
  legalMoveCount: number
  bestScore: EngineScore
  playedScore: EngineScore
}

export function centipawnLoss(
  bestScore: EngineScore,
  playedScore: EngineScore,
): number {
  return Math.max(
    0,
    scoreToCentipawns(bestScore) - scoreToCentipawns(playedScore),
  )
}

export function classifyMove(
  input: MoveClassificationInput,
): MoveClassification {
  if (input.legalMoveCount === 1) return 'forced'
  if (input.playedMove === input.bestMove) return 'best'

  const missedMate =
    input.bestScore.type === 'mate' &&
    input.bestScore.value > 0 &&
    !(input.playedScore.type === 'mate' && input.playedScore.value > 0)
  const allowedMate =
    input.playedScore.type === 'mate' &&
    input.playedScore.value < 0 &&
    !(input.bestScore.type === 'mate' && input.bestScore.value < 0)

  if (missedMate || allowedMate) return 'blunder'

  const loss = centipawnLoss(input.bestScore, input.playedScore)
  if (loss <= 20) return 'excellent'
  if (loss <= 60) return 'good'
  if (loss <= 120) return 'inaccuracy'
  if (loss <= 250) return 'mistake'
  return 'blunder'
}
