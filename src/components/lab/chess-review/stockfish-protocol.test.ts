// @ts-nocheck -- Bun test globals are outside the Astro tsconfig.
import { describe, expect, test } from 'bun:test'
import {
  applyEngineLine,
  createEngineOutputState,
  parseBestMoveLine,
  parseInfoLine,
} from './stockfish-protocol'

describe('Stockfish protocol parsing', () => {
  test('parses centipawn and mate info with a principal variation', () => {
    expect(
      parseInfoLine(
        'info depth 12 seldepth 19 multipv 1 score cp 34 nodes 100 pv e2e4 e7e5',
      ),
    ).toEqual({
      depth: 12,
      score: { type: 'cp', value: 34 },
      pv: ['e2e4', 'e7e5'],
    })
    expect(parseInfoLine('info depth 9 score mate -3 pv h7h8q')).toEqual({
      depth: 9,
      score: { type: 'mate', value: -3 },
      pv: ['h7h8q'],
    })
    expect(parseInfoLine('info depth 0 score mate 0')).toEqual({
      depth: 0,
      score: { type: 'mate', value: -1 },
      pv: [],
    })
  })

  test('ignores malformed and secondary multipv lines', () => {
    expect(parseInfoLine('Stockfish 18')).toBeNull()
    expect(parseInfoLine('info depth nope score cp 10')).toBeNull()
    expect(
      parseInfoLine('info depth 8 multipv 2 score cp 10 pv e2e4'),
    ).toBeNull()
    expect(
      parseInfoLine('info depth 8 score cp 34 upperbound pv e2e4'),
    ).toBeNull()
    expect(
      parseInfoLine('info depth 8 score cp -12 lowerbound pv d2d4'),
    ).toBeNull()
  })

  test('retains the deepest primary result and captures bestmove', () => {
    let state = createEngineOutputState()
    state = applyEngineLine(state, 'info depth 8 score cp 12 pv d2d4')
    state = applyEngineLine(state, 'info depth 7 score cp 99 pv e2e4')
    state = applyEngineLine(state, 'bestmove d2d4 ponder d7d5')

    expect(state.info?.depth).toBe(8)
    expect(state.info?.pv).toEqual(['d2d4'])
    expect(state.bestMove).toBe('d2d4')
    expect(parseBestMoveLine('bestmove (none)')).toBe('(none)')
  })
})
