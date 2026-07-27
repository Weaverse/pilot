// @ts-nocheck -- Bun test globals are outside the Astro tsconfig.
import { describe, expect, test } from 'bun:test'
import { parsePgn } from './pgn'
import { buildGameReview, principalVariationToSan } from './review'
import { SAMPLE_PGN } from './sample'

function analysis(fen, score, bestMove, pv = [bestMove]) {
  return { fen, depth: 12, score, bestMove, pv }
}

describe('game review assembly', () => {
  test('normalizes evaluations, summaries, PV, and turning point', () => {
    const game = parsePgn('1. e4 e5 2. Nf3')
    const [first, second, third] = game.moves
    const positions = [
      analysis(first.beforeFen, { type: 'cp', value: 100 }, 'd2d4', [
        'd2d4',
        'd7d5',
      ]),
      analysis(first.afterFen, { type: 'cp', value: -50 }, 'e7e5'),
      analysis(second.afterFen, { type: 'cp', value: 40 }, 'd2d4'),
      analysis(third.afterFen, { type: 'cp', value: -10 }, 'b8c6'),
    ]

    const review = buildGameReview(game, positions)

    expect(review.moves[0]).toMatchObject({
      classification: 'good',
      centipawnLoss: 50,
      evaluationBefore: 100,
      evaluationAfter: 50,
      bestMoveSan: 'd4',
      principalVariation: ['d4', 'd5'],
    })
    expect(review.moves[1].classification).toBe('best')
    expect(review.moves[2]).toMatchObject({
      classification: 'good',
      centipawnLoss: 30,
      evaluationBefore: 40,
      evaluationAfter: 10,
    })
    expect(review.white.averageCentipawnLoss).toBe(40)
    expect(review.white.classifications.good).toBe(2)
    expect(review.black.classifications.best).toBe(1)
    expect(review.turningPointPly).toBe(1)
    expect(review.moves[0].narrative).toContain('d4')
  })

  test('rejects missing position analysis and handles invalid PV tails', () => {
    const game = parsePgn('1. e4')
    expect(() => buildGameReview(game, [])).toThrow(
      'one analysis for every game position',
    )
    expect(principalVariationToSan(game.initialFen, ['e2e4', 'bad'])).toEqual([
      'e4',
    ])
  })

  test('bundled sample is a legal, bounded tactical game', () => {
    const game = parsePgn(SAMPLE_PGN)
    expect(game.moves).toHaveLength(7)
    expect(game.headers.Result).toBe('1-0')
    expect(game.moves.at(-1)?.san).toBe('Qxf7#')
  })
})
