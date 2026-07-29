// @ts-nocheck -- Bun test globals are outside the Astro tsconfig.
import { describe, expect, test } from 'bun:test'
import { Chess } from 'chess.js'
import { StockfishClient } from './stockfish-client'

const FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
const CHECKMATE_FEN =
  'rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3'

class MockWorker {
  commands: string[] = []
  terminated = false
  autoAnalyze = true
  messageListeners = new Set<(event: MessageEvent<string>) => void>()
  errorListeners = new Set<(event: ErrorEvent) => void>()

  postMessage(command: string) {
    this.commands.push(command)
    if (command === 'uci') queueMicrotask(() => this.emit('uciok'))
    if (command === 'isready') queueMicrotask(() => this.emit('readyok'))
    if (command.startsWith('go ') && this.autoAnalyze) {
      queueMicrotask(() => {
        this.emit('info depth 12 score cp 28 pv e2e4 e7e5')
        this.emit('bestmove e2e4 ponder e7e5')
      })
    }
  }

  terminate() {
    this.terminated = true
  }

  addEventListener(type: string, listener: never) {
    if (type === 'message') this.messageListeners.add(listener)
    else this.errorListeners.add(listener)
  }

  removeEventListener(type: string, listener: never) {
    if (type === 'message') this.messageListeners.delete(listener)
    else this.errorListeners.delete(listener)
  }

  emit(data: string) {
    for (const listener of this.messageListeners) listener({ data })
  }
}

describe('StockfishClient', () => {
  test('initializes UCI and analyzes one position in command order', async () => {
    const worker = new MockWorker()
    const client = new StockfishClient({ workerFactory: () => worker })

    const result = await client.analyze(FEN, 12)

    expect(worker.commands).toEqual([
      'uci',
      'isready',
      `position fen ${FEN}`,
      'go depth 12',
    ])
    expect(result).toEqual({
      fen: FEN,
      depth: 12,
      score: { type: 'cp', value: 28 },
      bestMove: 'e2e4',
      pv: ['e2e4', 'e7e5'],
    })
    client.dispose()
    expect(worker.terminated).toBe(true)
  })

  test('sends the full move history with the UCI position command', async () => {
    const worker = new MockWorker()
    const client = new StockfishClient({ workerFactory: () => worker })

    await client.analyze(FEN, 12, {
      initialFen: FEN,
      moves: ['e2e4', 'e7e5'],
    })

    expect(worker.commands).toContain(`position fen ${FEN} moves e2e4 e7e5`)
    client.dispose()
  })

  test('rejects overlapping analysis and cancels the active worker', async () => {
    const worker = new MockWorker()
    worker.autoAnalyze = false
    const client = new StockfishClient({ workerFactory: () => worker })
    const active = client.analyze(FEN, 10)
    await Bun.sleep(0)

    await expect(client.analyze(FEN, 10)).rejects.toThrow('already analyzing')
    client.cancel()

    await expect(active).rejects.toMatchObject({ name: 'AbortError' })
    expect(worker.commands.at(-1)).toBe('stop')
    expect(worker.terminated).toBe(true)
  })

  test('handles terminal bestmove without a preceding info line', async () => {
    const worker = new MockWorker()
    worker.autoAnalyze = false
    const client = new StockfishClient({ workerFactory: () => worker })
    const active = client.analyze(CHECKMATE_FEN, 10)
    await Bun.sleep(0)

    worker.emit('bestmove (none)')

    await expect(active).resolves.toEqual({
      fen: CHECKMATE_FEN,
      depth: 0,
      score: { type: 'mate', value: -1 },
      bestMove: '(none)',
      pv: [],
    })
    client.dispose()
  })

  test('recognizes a terminal repetition from the move history', async () => {
    const worker = new MockWorker()
    worker.autoAnalyze = false
    const client = new StockfishClient({ workerFactory: () => worker })
    const moves = [
      'g1f3',
      'g8f6',
      'f3g1',
      'f6g8',
      'g1f3',
      'g8f6',
      'f3g1',
      'f6g8',
    ]
    const chess = new Chess()
    for (const uci of moves) {
      chess.move({ from: uci.slice(0, 2), to: uci.slice(2, 4) })
    }
    const active = client.analyze(chess.fen(), 10, {
      initialFen: FEN,
      moves,
    })
    await Bun.sleep(0)

    worker.emit('bestmove (none)')

    await expect(active).resolves.toEqual({
      fen: chess.fen(),
      depth: 0,
      score: { type: 'cp', value: 0 },
      bestMove: '(none)',
      pv: [],
    })
    client.dispose()
  })

  test('times out initialization and terminates the failed worker', async () => {
    const worker = new MockWorker()
    worker.postMessage = (command: string) => worker.commands.push(command)
    const client = new StockfishClient({
      workerFactory: () => worker,
      initTimeoutMs: 5,
    })

    await expect(client.initialize()).rejects.toThrow('UCI initialization')
    expect(worker.terminated).toBe(true)
  })
})
