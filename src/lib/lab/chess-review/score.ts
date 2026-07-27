import type { EngineScore, FenTurn } from './types'

export const MATE_SCORE_CENTIPAWNS = 100_000
const MATE_PLY_PENALTY = 100

export function negateScore(score: EngineScore): EngineScore {
  return { ...score, value: -score.value }
}

export function scoreToCentipawns(score: EngineScore): number {
  if (score.type === 'cp') return score.value
  const distancePenalty = Math.min(
    Math.abs(score.value) * MATE_PLY_PENALTY,
    MATE_SCORE_CENTIPAWNS / 2,
  )
  return Math.sign(score.value) * (MATE_SCORE_CENTIPAWNS - distancePenalty)
}

export function scoreFromWhitePerspective(
  score: EngineScore,
  turn: FenTurn,
): EngineScore {
  return turn === 'w' ? score : negateScore(score)
}

export function turnFromFen(fen: string): FenTurn {
  const turn = fen.split(/\s+/)[1]
  if (turn !== 'w' && turn !== 'b') {
    throw new Error('Invalid FEN turn field.')
  }
  return turn
}
