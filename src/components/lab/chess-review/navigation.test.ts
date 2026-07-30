// @ts-nocheck -- Bun test globals are outside the Astro tsconfig.
import { describe, expect, test } from 'bun:test'
import { clampPly, isReviewNavigationKey, navigatePly } from './navigation'
import {
  evaluationPercent,
  formatEvaluation,
  isNotable,
  uciSquares,
} from './ui'

describe('review navigation', () => {
  test('clamps button and keyboard navigation at both boundaries', () => {
    expect(clampPly(-1, 8)).toBe(0)
    expect(clampPly(9, 8)).toBe(8)
    expect(navigatePly(0, 'ArrowLeft', 8)).toBe(0)
    expect(navigatePly(8, 'ArrowRight', 8)).toBe(8)
    expect(navigatePly(4, 'Home', 8)).toBe(0)
    expect(navigatePly(4, 'End', 8)).toBe(8)
  })

  test('recognizes only supported review shortcuts', () => {
    expect(isReviewNavigationKey('ArrowLeft')).toBe(true)
    expect(isReviewNavigationKey('PageDown')).toBe(false)
  })
})

describe('review UI helpers', () => {
  test('formats evaluations, UCI squares, and notable labels', () => {
    expect(formatEvaluation(35)).toBe('+0.3')
    expect(formatEvaluation(-120)).toBe('−1.2')
    expect(formatEvaluation(99_900)).toBe('+M')
    expect(uciSquares('e7e8q')).toEqual(['e7', 'e8'])
    expect(uciSquares('invalid')).toBeNull()
    expect(isNotable('inaccuracy')).toBe(true)
    expect(isNotable('best')).toBe(false)
  })

  test('keeps evaluation bars visible at decisive scores', () => {
    expect(evaluationPercent(100_000)).toBe(96)
    expect(evaluationPercent(-100_000)).toBe(4)
    expect(evaluationPercent(0)).toBe(50)
  })
})
