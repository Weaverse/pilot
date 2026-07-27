import { Chess } from 'chess.js'
import type { ChessColor, ParsedGame, ParsedMove } from './types'

export const MAX_GAME_PLIES = 240
const MAX_HEADER_LENGTH = 200

export class PgnError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PgnError'
  }
}

function sanitizeHeaders(
  headers: Record<string, string>,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(headers).map(([key, value]) => [
      key.slice(0, MAX_HEADER_LENGTH),
      value.trim().slice(0, MAX_HEADER_LENGTH),
    ]),
  )
}

function colorForPly(ply: number): ChessColor {
  return ply % 2 === 1 ? 'white' : 'black'
}

function legalMoveCount(fen: string): number {
  return new Chess(fen).moves().length
}

export function parsePgn(input: string): ParsedGame {
  const pgn = input.trim()
  if (!pgn) throw new PgnError('Paste a PGN with at least one move.')

  const chess = new Chess()
  try {
    chess.loadPgn(pgn)
  } catch {
    throw new PgnError(
      'This PGN could not be parsed. Check the moves and try again.',
    )
  }

  const history = chess.history({ verbose: true })
  if (history.length === 0) {
    throw new PgnError('The PGN does not contain any moves to review.')
  }
  if (history.length > MAX_GAME_PLIES) {
    throw new PgnError(
      `This game has ${history.length} plies. Reviews are limited to ${MAX_GAME_PLIES}.`,
    )
  }

  const moves: ParsedMove[] = history.map((move, index) => {
    const ply = index + 1
    return {
      ply,
      moveNumber: Math.ceil(ply / 2),
      color: colorForPly(ply),
      san: move.san,
      uci: move.lan,
      beforeFen: move.before,
      afterFen: move.after,
      legalMoveCount: legalMoveCount(move.before),
    }
  })

  return {
    headers: sanitizeHeaders(chess.getHeaders()),
    initialFen: moves[0].beforeFen,
    finalFen: moves.at(-1)?.afterFen ?? moves[0].beforeFen,
    moves,
  }
}

export function uciToSan(fen: string, uci: string): string | null {
  const match = /^([a-h][1-8])([a-h][1-8])([qrbn])?$/.exec(uci)
  if (!match) return null

  try {
    const chess = new Chess(fen)
    return chess.move({
      from: match[1],
      to: match[2],
      promotion: match[3],
    }).san
  } catch {
    return null
  }
}
