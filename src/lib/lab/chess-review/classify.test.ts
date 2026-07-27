// @ts-nocheck -- Bun test globals are outside the Astro tsconfig.
import { describe, expect, test } from 'bun:test'
import { centipawnLoss, classifyMove } from './classify'

function input(loss: number) {
  return {
    playedMove: 'e2e4',
    bestMove: 'd2d4',
    legalMoveCount: 20,
    bestScore: { type: 'cp' as const, value: 300 },
    playedScore: { type: 'cp' as const, value: 300 - loss },
  }
}

describe('move classification', () => {
  test('uses deterministic centipawn-loss boundaries', () => {
    expect(classifyMove(input(15))).toBe('excellent')
    expect(classifyMove(input(16))).toBe('good')
    expect(classifyMove(input(50))).toBe('good')
    expect(classifyMove(input(51))).toBe('inaccuracy')
    expect(classifyMove(input(100))).toBe('inaccuracy')
    expect(classifyMove(input(101))).toBe('mistake')
    expect(classifyMove(input(200))).toBe('mistake')
    expect(classifyMove(input(201))).toBe('blunder')
  })

  test('gives forced and engine-best moves explicit precedence', () => {
    expect(classifyMove({ ...input(500), legalMoveCount: 1 })).toBe('forced')
    expect(
      classifyMove({ ...input(500), playedMove: 'd2d4', bestMove: 'd2d4' }),
    ).toBe('best')
  })

  test('classifies missed and newly allowed mate as blunders', () => {
    expect(
      classifyMove({
        ...input(0),
        bestScore: { type: 'mate', value: 3 },
        playedScore: { type: 'cp', value: 800 },
      }),
    ).toBe('blunder')
    expect(
      classifyMove({
        ...input(0),
        bestScore: { type: 'cp', value: -100 },
        playedScore: { type: 'mate', value: -2 },
      }),
    ).toBe('blunder')
  })

  test('never reports negative centipawn loss', () => {
    expect(
      centipawnLoss({ type: 'cp', value: 10 }, { type: 'cp', value: 40 }),
    ).toBe(0)
  })
})
