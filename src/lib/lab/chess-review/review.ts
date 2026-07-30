import { Chess } from 'chess.js'
import {
  centipawnLoss,
  classifyMove,
  mateDistanceDeterioration,
} from './classify'
import { moveNarrative } from './narrative'
import { uciToSan } from './pgn'
import {
  negateScore,
  scoreFromWhitePerspective,
  scoreToCentipawns,
  turnFromFen,
} from './score'
import type {
  ChessColor,
  GameReview,
  MoveClassification,
  MoveReview,
  ParsedGame,
  PlayerReviewSummary,
  PositionAnalysis,
} from './types'

const CLASSIFICATIONS: MoveClassification[] = [
  'forced',
  'best',
  'excellent',
  'good',
  'inaccuracy',
  'mistake',
  'blunder',
]
const MAX_SUMMARY_LOSS_CP = 1_000

export function principalVariationToSan(fen: string, pv: string[]): string[] {
  const chess = new Chess(fen)
  const san: string[] = []

  for (const uci of pv.slice(0, 8)) {
    const match = /^([a-h][1-8])([a-h][1-8])([qrbn])?$/.exec(uci)
    if (!match) break
    try {
      san.push(
        chess.move({
          from: match[1],
          to: match[2],
          promotion: match[3],
        }).san,
      )
    } catch {
      break
    }
  }

  return san
}

function emptyCounts(): Record<MoveClassification, number> {
  return Object.fromEntries(
    CLASSIFICATIONS.map((classification) => [classification, 0]),
  ) as Record<MoveClassification, number>
}

function accuracyForLoss(loss: number): number {
  return 100 * Math.exp(-loss / 300)
}

function summarize(
  color: ChessColor,
  moves: MoveReview[],
): PlayerReviewSummary {
  const playerMoves = moves.filter((move) => move.color === color)
  const classifications = emptyCounts()
  for (const move of playerMoves) classifications[move.classification] += 1

  if (playerMoves.length === 0) {
    return {
      color,
      accuracy: 0,
      averageCentipawnLoss: 0,
      classifications,
    }
  }

  const totalLoss = playerMoves.reduce(
    (total, move) => total + Math.min(move.centipawnLoss, MAX_SUMMARY_LOSS_CP),
    0,
  )
  const totalAccuracy = playerMoves.reduce(
    (total, move) => total + accuracyForLoss(move.centipawnLoss),
    0,
  )

  return {
    color,
    accuracy: Number((totalAccuracy / playerMoves.length).toFixed(1)),
    averageCentipawnLoss: Number((totalLoss / playerMoves.length).toFixed(1)),
    classifications,
  }
}

export function buildGameReview(
  game: ParsedGame,
  positions: PositionAnalysis[],
): GameReview {
  if (positions.length !== game.moves.length + 1) {
    throw new Error('A review requires one analysis for every game position.')
  }

  const moves: MoveReview[] = game.moves.map((move, index) => {
    const before = positions[index]
    const after = positions[index + 1]
    const playedScore = negateScore(after.score)
    const loss = centipawnLoss(before.score, playedScore)
    const classification = classifyMove({
      playedMove: move.uci,
      bestMove: before.bestMove,
      legalMoveCount: move.legalMoveCount,
      bestScore: before.score,
      playedScore,
    })
    const principalVariation = principalVariationToSan(
      move.beforeFen,
      before.pv,
    )
    const bestMoveSan = uciToSan(move.beforeFen, before.bestMove)
    const mateDeterioration = mateDistanceDeterioration(
      before.score,
      playedScore,
    )
    const mateDistanceLoss =
      mateDeterioration !== null && mateDeterioration > 0
        ? before.score.value > 0
          ? 'slower-win'
          : 'faster-loss'
        : null
    const bestLine =
      before.pv[0] === before.bestMove
        ? principalVariation
        : bestMoveSan
          ? [bestMoveSan]
          : []

    return {
      ...move,
      classification,
      centipawnLoss: loss,
      evaluationBefore: scoreToCentipawns(
        scoreFromWhitePerspective(before.score, turnFromFen(move.beforeFen)),
      ),
      evaluationAfter: scoreToCentipawns(
        scoreFromWhitePerspective(after.score, turnFromFen(move.afterFen)),
      ),
      bestMove: before.bestMove,
      bestMoveSan,
      principalVariation: bestLine,
      narrative: moveNarrative({
        classification,
        centipawnLoss: loss,
        bestMoveSan,
        mateDistanceLoss,
      }),
    }
  })

  const turningPoint = moves.reduce<MoveReview | null>((largest, move) => {
    if (move.classification === 'forced') return largest
    if (!largest || move.centipawnLoss > largest.centipawnLoss) return move
    return largest
  }, null)

  return {
    game,
    positions,
    moves,
    white: summarize('white', moves),
    black: summarize('black', moves),
    turningPointPly:
      turningPoint && turningPoint.centipawnLoss > 0 ? turningPoint.ply : null,
  }
}
