// @ts-nocheck -- Bun test globals are outside the Astro tsconfig.
import { describe, expect, test } from 'bun:test'
import {
  MATE_SCORE_CENTIPAWNS,
  negateScore,
  scoreFromWhitePerspective,
  scoreToCentipawns,
  turnFromFen,
} from './score'

describe('engine score helpers', () => {
  test('normalizes scores without mutating their type', () => {
    expect(negateScore({ type: 'cp', value: 42 })).toEqual({
      type: 'cp',
      value: -42,
    })
    expect(scoreFromWhitePerspective({ type: 'mate', value: 3 }, 'b')).toEqual({
      type: 'mate',
      value: -3,
    })
  })

  test('maps mate scores beyond normal centipawn evaluations', () => {
    expect(scoreToCentipawns({ type: 'cp', value: 125 })).toBe(125)
    expect(scoreToCentipawns({ type: 'mate', value: 2 })).toBe(
      MATE_SCORE_CENTIPAWNS - 200,
    )
    expect(scoreToCentipawns({ type: 'mate', value: -2 })).toBe(
      -MATE_SCORE_CENTIPAWNS + 200,
    )
  })

  test('reads the active color from FEN and rejects malformed input', () => {
    expect(turnFromFen('8/8/8/8/8/8/8/8 w - - 0 1')).toBe('w')
    expect(turnFromFen('8/8/8/8/8/8/8/8 b - - 0 1')).toBe('b')
    expect(() => turnFromFen('not a fen')).toThrow('Invalid FEN turn field')
  })
})
