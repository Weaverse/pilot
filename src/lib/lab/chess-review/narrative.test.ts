// @ts-nocheck -- Bun test globals are outside the Astro tsconfig.
import { describe, expect, test } from 'bun:test'
import { classificationLabel, moveNarrative } from './narrative'

describe('review narrative', () => {
  test('uses factual labels and names the stronger move when available', () => {
    expect(classificationLabel('inaccuracy')).toBe('Inaccuracy')
    expect(
      moveNarrative({
        classification: 'mistake',
        centipawnLoss: 145,
        bestMoveSan: 'Nf3',
      }),
    ).toBe(
      'This loses about 1.4 pawns and shifts the position. Nf3 was the engine’s top choice.',
    )
  })

  test('describes mate swings without fake pawn counts', () => {
    expect(
      moveNarrative({
        classification: 'blunder',
        centipawnLoss: 99_800,
        bestMoveSan: 'Qh7#',
      }),
    ).toBe(
      'A critical error that changes a forced-mate outcome. Qh7# was the engine’s top choice.',
    )
  })

  test('does not invent an alternative when no legal PV move is available', () => {
    expect(
      moveNarrative({
        classification: 'blunder',
        centipawnLoss: 320,
        bestMoveSan: null,
      }),
    ).not.toContain('top choice')
  })
})
