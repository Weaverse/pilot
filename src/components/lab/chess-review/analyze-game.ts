import { buildGameReview } from '~/lib/lab/chess-review/review'
import type {
  AnalysisProgress,
  GameReview,
  ParsedGame,
  PositionAnalysis,
} from '~/lib/lab/chess-review/types'

export interface ChessEngine {
  analyze(fen: string, depth: number): Promise<PositionAnalysis>
  cancel(): void
}

interface AnalyzeGameOptions {
  depth: number
  signal?: AbortSignal
  onProgress?: (progress: AnalysisProgress) => void
}

function abortError(): DOMException {
  return new DOMException('Chess analysis was cancelled.', 'AbortError')
}

export async function analyzeGame(
  game: ParsedGame,
  engine: ChessEngine,
  options: AnalyzeGameOptions,
): Promise<GameReview> {
  const fens = [game.initialFen, ...game.moves.map((move) => move.afterFen)]
  const positions: PositionAnalysis[] = []

  const cancel = () => engine.cancel()
  options.signal?.addEventListener('abort', cancel, { once: true })

  try {
    options.onProgress?.({
      completed: 0,
      total: fens.length,
      currentPly: game.moves[0]?.ply ?? null,
    })

    for (const [index, fen] of fens.entries()) {
      if (options.signal?.aborted) throw abortError()
      positions.push(await engine.analyze(fen, options.depth))
      if (options.signal?.aborted) throw abortError()

      options.onProgress?.({
        completed: index + 1,
        total: fens.length,
        currentPly:
          index + 1 < fens.length ? (game.moves[index]?.ply ?? null) : null,
      })
    }
  } finally {
    options.signal?.removeEventListener('abort', cancel)
  }

  return buildGameReview(game, positions)
}
