import { scoreToCentipawns } from './score'
import type { EngineScore, MoveClassification } from './types'

export interface MoveClassificationInput {
  playedMove: string
  bestMove: string
  legalMoveCount: number
  bestScore: EngineScore
  playedScore: EngineScore
}

function mateDistanceDeterioration(
  bestScore: EngineScore,
  playedScore: EngineScore,
): number | null {
  if (
    bestScore.type !== 'mate' ||
    playedScore.type !== 'mate' ||
    Math.sign(bestScore.value) !== Math.sign(playedScore.value)
  )
    return null

  return bestScore.value > 0
    ? Math.max(0, Math.abs(playedScore.value) - Math.abs(bestScore.value))
    : Math.max(0, Math.abs(bestScore.value) - Math.abs(playedScore.value))
}

export function centipawnLoss(
  bestScore: EngineScore,
  playedScore: EngineScore,
): number {
  const mateDeterioration = mateDistanceDeterioration(bestScore, playedScore)
  if (mateDeterioration !== null) {
    if (mateDeterioration === 0) return 0
    if (mateDeterioration === 1) return 60
    return Math.min(120, 60 + (mateDeterioration - 1) * 10)
  }

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

  const mateDeterioration = mateDistanceDeterioration(
    input.bestScore,
    input.playedScore,
  )
  if (mateDeterioration !== null) {
    if (mateDeterioration === 0) return 'excellent'
    if (mateDeterioration === 1) return 'good'
    return 'inaccuracy'
  }

  const loss = centipawnLoss(input.bestScore, input.playedScore)
  if (loss <= 20) return 'excellent'
  if (loss <= 60) return 'good'
  if (loss <= 120) return 'inaccuracy'
  if (loss <= 250) return 'mistake'
  return 'blunder'
}
