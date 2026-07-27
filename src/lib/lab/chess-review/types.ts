export type ChessColor = 'white' | 'black'
export type FenTurn = 'w' | 'b'

export interface ParsedMove {
  ply: number
  moveNumber: number
  color: ChessColor
  san: string
  uci: string
  beforeFen: string
  afterFen: string
  legalMoveCount: number
}

export interface ParsedGame {
  headers: Record<string, string>
  initialFen: string
  finalFen: string
  moves: ParsedMove[]
}

export type EngineScore =
  | { type: 'cp'; value: number }
  | { type: 'mate'; value: number }

export interface PositionAnalysis {
  fen: string
  depth: number
  score: EngineScore
  bestMove: string
  pv: string[]
}
