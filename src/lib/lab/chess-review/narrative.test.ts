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
        mateDistanceLoss: null,
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
        mateDistanceLoss: null,
      }),
    ).toBe(
      'A critical error that changes a forced-mate outcome. Qh7# was the engine’s top choice.',
    )
  })

  test('describes mate-distance deterioration without material claims', () => {
    expect(
      moveNarrative({
        classification: 'inaccuracy',
        centipawnLoss: 90,
        bestMoveSan: 'Qh7#',
        mateDistanceLoss: 'slower-win',
      }),
    ).toBe(
      'This still forces mate, but takes longer. Qh7# was the engine’s top choice.',
    )
    expect(
      moveNarrative({
        classification: 'inaccuracy',
        centipawnLoss: 90,
        bestMoveSan: null,
        mateDistanceLoss: 'faster-loss',
      }),
    ).toBe('This allows the opponent to force mate sooner.')
  })

  test('does not invent an alternative when no legal PV move is available', () => {
    expect(
      moveNarrative({
        classification: 'blunder',
        centipawnLoss: 320,
        bestMoveSan: null,
        mateDistanceLoss: null,
      }),
    ).not.toContain('top choice')
  })
})
