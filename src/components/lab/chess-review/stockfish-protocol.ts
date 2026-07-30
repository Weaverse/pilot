import type { EngineScore } from '~/lib/lab/chess-review/types'

export interface EngineInfo {
  depth: number
  score: EngineScore
  pv: string[]
}

export interface EngineOutputState {
  info: EngineInfo | null
  bestMove: string | null
}

export function createEngineOutputState(): EngineOutputState {
  return { info: null, bestMove: null }
}

function tokenValue(tokens: string[], name: string): string | null {
  const index = tokens.indexOf(name)
  return index >= 0 && index + 1 < tokens.length ? tokens[index + 1] : null
}

export function parseInfoLine(line: string): EngineInfo | null {
  if (!line.startsWith('info ')) return null
  const tokens = line.trim().split(/\s+/)
  const depth = Number(tokenValue(tokens, 'depth'))
  const multipv = Number(tokenValue(tokens, 'multipv') ?? '1')
  const scoreIndex = tokens.indexOf('score')

  if (!Number.isInteger(depth) || depth < 0 || multipv !== 1) return null
  if (scoreIndex < 0 || scoreIndex + 2 >= tokens.length) return null
  if (tokens.includes('lowerbound') || tokens.includes('upperbound'))
    return null

  const scoreType = tokens[scoreIndex + 1]
  const parsedScoreValue = Number(tokens[scoreIndex + 2])
  if (
    (scoreType !== 'cp' && scoreType !== 'mate') ||
    !Number.isFinite(parsedScoreValue)
  ) {
    return null
  }
  const scoreValue =
    scoreType === 'mate' && parsedScoreValue === 0 ? -1 : parsedScoreValue

  const pvIndex = tokens.indexOf('pv')
  const pv = pvIndex >= 0 ? tokens.slice(pvIndex + 1) : []

  return {
    depth,
    score: { type: scoreType, value: scoreValue },
    pv,
  }
}

export function parseBestMoveLine(line: string): string | null {
  const match = /^bestmove\s+(\S+)/.exec(line.trim())
  return match?.[1] ?? null
}

export function applyEngineLine(
  state: EngineOutputState,
  line: string,
): EngineOutputState {
  const info = parseInfoLine(line)
  if (info && (!state.info || info.depth >= state.info.depth)) {
    return { ...state, info }
  }

  const bestMove = parseBestMoveLine(line)
  if (bestMove) return { ...state, bestMove }

  return state
}
