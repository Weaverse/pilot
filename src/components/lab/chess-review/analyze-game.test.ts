// @ts-nocheck -- Bun test globals are outside the Astro tsconfig.
import { describe, expect, test } from 'bun:test'
import { parsePgn } from '~/lib/lab/chess-review/pgn'
import { analyzeGame } from './analyze-game'

class SequenceEngine {
  calls: string[] = []
  cancelled = 0

  async analyze(fen: string, depth: number) {
    this.calls.push(fen)
    return {
      fen,
      depth,
      score: { type: 'cp', value: 0 },
      bestMove: this.calls.length === 1 ? 'e2e4' : '(none)',
      pv: this.calls.length === 1 ? ['e2e4'] : [],
    }
  }

  cancel() {
    this.cancelled += 1
  }
}

describe('analyzeGame', () => {
  test('analyzes exactly N+1 positions and reports monotonic progress', async () => {
    const game = parsePgn('1. e4 e5 2. Nf3')
    const engine = new SequenceEngine()
    const progress = []

    const review = await analyzeGame(game, engine, {
      depth: 8,
      onProgress: (value) => progress.push(value),
    })

    expect(engine.calls).toEqual([
      game.initialFen,
      ...game.moves.map((move) => move.afterFen),
    ])
    expect(progress.map((value) => value.completed)).toEqual([0, 1, 2, 3, 4])
    expect(progress.map((value) => value.currentPly)).toEqual([
      1,
      1,
      2,
      3,
      null,
    ])
    expect(progress.at(-1)).toEqual({
      completed: 4,
      total: 4,
      currentPly: null,
    })
    expect(review.moves).toHaveLength(3)
  })

  test('cancels the engine and rejects partial results on abort', async () => {
    const game = parsePgn('1. e4')
    let rejectAnalysis: ((error: Error) => void) | undefined
    const engine = {
      analyze: () =>
        new Promise((_, reject) => {
          rejectAnalysis = reject
        }),
      cancel: () =>
        rejectAnalysis?.(
          new DOMException('Chess analysis was cancelled.', 'AbortError'),
        ),
    }
    const controller = new AbortController()
    const pending = analyzeGame(game, engine, {
      depth: 8,
      signal: controller.signal,
    })
    await Bun.sleep(0)

    controller.abort()

    await expect(pending).rejects.toMatchObject({ name: 'AbortError' })
  })
})
