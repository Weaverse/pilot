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

export interface AnalysisHistory {
  initialFen: string
  moves: string[]
}

export interface PositionAnalysis {
  fen: string
  depth: number
  score: EngineScore
  bestMove: string
  pv: string[]
}

export type MoveClassification =
  | 'forced'
  | 'best'
  | 'excellent'
  | 'good'
  | 'inaccuracy'
  | 'mistake'
  | 'blunder'

export interface MoveReview extends ParsedMove {
  classification: MoveClassification
  centipawnLoss: number
  evaluationBefore: number
  evaluationAfter: number
  bestMove: string
  bestMoveSan: string | null
  principalVariation: string[]
  narrative: string
}

export interface PlayerReviewSummary {
  color: ChessColor
  accuracy: number
  averageCentipawnLoss: number
  classifications: Record<MoveClassification, number>
}

export interface GameReview {
  game: ParsedGame
  positions: PositionAnalysis[]
  moves: MoveReview[]
  white: PlayerReviewSummary
  black: PlayerReviewSummary
  turningPointPly: number | null
}

export interface AnalysisProgress {
  completed: number
  total: number
  currentPly: number | null
}
