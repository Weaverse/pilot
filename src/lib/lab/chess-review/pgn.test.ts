// @ts-nocheck -- Bun test globals are outside the Astro tsconfig.
import { describe, expect, test } from 'bun:test'
import { Chess } from 'chess.js'
import { MAX_GAME_PLIES, PgnError, parsePgn, uciToSan } from './pgn'

const SAMPLE_PGN = `[Event "Friendly game"]
[White "Ada"]
[Black "Grace"]
[Result "1-0"]

1. e4 {King pawn opening} e5 2. Nf3 Nc6 3. Bb5 a6 1-0`

function repeatedKnightGame(plies: number): string {
  const chess = new Chess()
  const cycle = ['Nf3', 'Nf6', 'Ng1', 'Ng8']
  for (let index = 0; index < plies; index += 1) {
    chess.move(cycle[index % cycle.length])
  }
  return chess.pgn()
}

describe('parsePgn', () => {
  test('parses headers, comments, FENs, SAN, and UCI locally', () => {
    const game = parsePgn(SAMPLE_PGN)

    expect(game.headers).toMatchObject({
      Event: 'Friendly game',
      White: 'Ada',
      Black: 'Grace',
      Result: '1-0',
    })
    expect(game.moves).toHaveLength(6)
    expect(game.moves[0]).toMatchObject({
      ply: 1,
      moveNumber: 1,
      color: 'white',
      san: 'e4',
      uci: 'e2e4',
      legalMoveCount: 20,
    })
    expect(game.moves[0].beforeFen).toBe(game.initialFen)
    expect(game.moves.at(-1)?.afterFen).toBe(game.finalFen)
  })

  test('rejects empty, zero-move, malformed, and oversized games', () => {
    expect(() => parsePgn('')).toThrow(PgnError)
    expect(() => parsePgn('[Event "No moves"]')).toThrow(
      'does not contain any moves',
    )
    expect(() => parsePgn('1. e4 e5 2. not-a-move')).toThrow(
      'could not be parsed',
    )
    expect(parsePgn(repeatedKnightGame(MAX_GAME_PLIES)).moves).toHaveLength(
      MAX_GAME_PLIES,
    )
    expect(() => parsePgn(repeatedKnightGame(MAX_GAME_PLIES + 1))).toThrow(
      `limited to ${MAX_GAME_PLIES}`,
    )
  })

  test('sanitizes untrusted headers to a bounded plain-text value', () => {
    const longName = `  ${'<script>'.repeat(40)}  `
    const game = parsePgn(`[White "${longName}"]\n\n1. e4`)

    expect(game.headers.White).not.toStartWith(' ')
    expect(game.headers.White.length).toBeLessThanOrEqual(200)
  })
})

describe('uciToSan', () => {
  test('converts castling, promotion, and en passant moves', () => {
    expect(uciToSan('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1', 'e1g1')).toBe('O-O')
    expect(uciToSan('8/P7/8/8/8/8/7k/4K3 w - - 0 1', 'a7a8q')).toBe('a8=Q')
    expect(uciToSan('4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 1', 'e5d6')).toBe('exd6')
  })

  test('returns null for malformed or illegal UCI', () => {
    expect(uciToSan(new Chess().fen(), 'wat')).toBeNull()
    expect(uciToSan(new Chess().fen(), 'e2e5')).toBeNull()
  })
})
