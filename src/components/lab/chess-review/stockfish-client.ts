import { Chess } from 'chess.js'
import type {
  AnalysisHistory,
  PositionAnalysis,
} from '~/lib/lab/chess-review/types'
import {
  applyEngineLine,
  createEngineOutputState,
  parseBestMoveLine,
} from './stockfish-protocol'

export const STOCKFISH_WORKER_PATH =
  '/static/lab/chess-review/stockfish/stockfish-18-lite-single.js'

const DEFAULT_INIT_TIMEOUT_MS = 15_000
const DEFAULT_ANALYSIS_TIMEOUT_MS = 45_000

interface WorkerLike {
  postMessage(message: string): void
  terminate(): void
  addEventListener(
    type: 'message',
    listener: (event: MessageEvent<string>) => void,
  ): void
  addEventListener(type: 'error', listener: (event: ErrorEvent) => void): void
  removeEventListener(
    type: 'message',
    listener: (event: MessageEvent<string>) => void,
  ): void
  removeEventListener(
    type: 'error',
    listener: (event: ErrorEvent) => void,
  ): void
}

type WorkerFactory = () => WorkerLike

interface LineWaiter {
  predicate: (line: string) => boolean
  resolve: (line: string) => void
  reject: (error: Error) => void
  timer: ReturnType<typeof setTimeout>
}

interface ActiveAnalysis {
  reject: (error: Error) => void
  cleanup: () => void
}

interface StockfishClientOptions {
  workerFactory?: WorkerFactory
  initTimeoutMs?: number
  analysisTimeoutMs?: number
}

function abortError(): Error {
  return new DOMException('Chess analysis was cancelled.', 'AbortError')
}

function terminalAnalysis(
  fen: string,
  bestMove: string,
  history?: AnalysisHistory,
): PositionAnalysis | null {
  if (bestMove !== '(none)') return null

  try {
    const chess = history ? new Chess(history.initialFen) : new Chess(fen)
    for (const uci of history?.moves ?? []) {
      const match = /^([a-h][1-8])([a-h][1-8])([qrbn])?$/.exec(uci)
      if (!match) return null
      chess.move({ from: match[1], to: match[2], promotion: match[3] })
    }
    if (!chess.isGameOver()) return null
    return {
      fen,
      depth: 0,
      score: chess.isCheckmate()
        ? { type: 'mate', value: -1 }
        : { type: 'cp', value: 0 },
      bestMove,
      pv: [],
    }
  } catch {
    return null
  }
}

function positionCommand(fen: string, history?: AnalysisHistory): string {
  if (!history) return `position fen ${fen}`
  const moves =
    history.moves.length > 0 ? ` moves ${history.moves.join(' ')}` : ''
  return `position fen ${history.initialFen}${moves}`
}

export class StockfishClient {
  private readonly workerFactory: WorkerFactory
  private readonly initTimeoutMs: number
  private readonly analysisTimeoutMs: number
  private worker: WorkerLike | null = null
  private initializePromise: Promise<void> | null = null
  private lineWaiters = new Set<LineWaiter>()
  private lineListeners = new Set<(line: string) => void>()
  private activeAnalysis: ActiveAnalysis | null = null
  private disposed = false

  constructor(options: StockfishClientOptions = {}) {
    this.workerFactory =
      options.workerFactory ?? (() => new Worker(STOCKFISH_WORKER_PATH))
    this.initTimeoutMs = options.initTimeoutMs ?? DEFAULT_INIT_TIMEOUT_MS
    this.analysisTimeoutMs =
      options.analysisTimeoutMs ?? DEFAULT_ANALYSIS_TIMEOUT_MS
  }

  private readonly handleMessage = (event: MessageEvent<string>) => {
    for (const line of String(event.data).split('\n')) {
      const value = line.trim()
      if (!value) continue

      for (const listener of this.lineListeners) listener(value)
      for (const waiter of [...this.lineWaiters]) {
        if (!waiter.predicate(value)) continue
        clearTimeout(waiter.timer)
        this.lineWaiters.delete(waiter)
        waiter.resolve(value)
      }
    }
  }

  private readonly handleError = (event: ErrorEvent) => {
    this.resetWorker(new Error(event.message || 'Stockfish worker failed.'))
  }

  private ensureWorker(): WorkerLike {
    if (this.disposed) throw new Error('Stockfish client has been disposed.')
    if (this.worker) return this.worker

    const worker = this.workerFactory()
    worker.addEventListener('message', this.handleMessage)
    worker.addEventListener('error', this.handleError)
    this.worker = worker
    return worker
  }

  private post(command: string) {
    this.ensureWorker().postMessage(command)
  }

  private waitForLine(
    predicate: (line: string) => boolean,
    timeoutMs: number,
    timeoutMessage: string,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const waiter: LineWaiter = {
        predicate,
        resolve,
        reject,
        timer: setTimeout(() => {
          this.lineWaiters.delete(waiter)
          reject(new Error(timeoutMessage))
        }, timeoutMs),
      }
      this.lineWaiters.add(waiter)
    })
  }

  async initialize(): Promise<void> {
    if (this.initializePromise) return this.initializePromise

    this.initializePromise = (async () => {
      this.ensureWorker()
      const uciOk = this.waitForLine(
        (line) => line === 'uciok',
        this.initTimeoutMs,
        'Stockfish did not finish UCI initialization.',
      )
      this.post('uci')
      await uciOk

      const readyOk = this.waitForLine(
        (line) => line === 'readyok',
        this.initTimeoutMs,
        'Stockfish did not become ready.',
      )
      this.post('isready')
      await readyOk
    })().catch((error) => {
      this.resetWorker(
        error instanceof Error ? error : new Error(String(error)),
      )
      throw error
    })

    return this.initializePromise
  }

  async analyze(
    fen: string,
    depth: number,
    history?: AnalysisHistory,
  ): Promise<PositionAnalysis> {
    if (!Number.isInteger(depth) || depth < 1) {
      throw new Error('Analysis depth must be a positive integer.')
    }
    await this.initialize()
    if (this.activeAnalysis) {
      throw new Error('Stockfish is already analyzing a position.')
    }

    return new Promise((resolve, reject) => {
      let output = createEngineOutputState()
      let timer: ReturnType<typeof setTimeout>

      const onLine = (line: string) => {
        output = applyEngineLine(output, line)
        const bestMove = parseBestMoveLine(line)
        if (!bestMove) return

        const terminal = terminalAnalysis(fen, bestMove, history)
        if (!output.info && terminal) {
          finish(null, terminal)
          return
        }

        if (!output.info || !output.bestMove) {
          finish(new Error('Stockfish returned an incomplete analysis.'))
          return
        }

        finish(null, {
          fen,
          depth: output.info.depth,
          score: output.info.score,
          bestMove: output.bestMove,
          pv: output.info.pv,
        })
      }

      const cleanup = () => {
        clearTimeout(timer)
        this.lineListeners.delete(onLine)
        this.activeAnalysis = null
      }

      const finish = (error: Error | null, result?: PositionAnalysis) => {
        cleanup()
        if (error) reject(error)
        else if (result) resolve(result)
      }

      timer = setTimeout(() => {
        const error = new Error('Stockfish analysis timed out.')
        finish(error)
        this.resetWorker(error)
      }, this.analysisTimeoutMs)

      this.activeAnalysis = { reject, cleanup }
      this.lineListeners.add(onLine)
      this.post(positionCommand(fen, history))
      this.post(`go depth ${depth}`)
    })
  }

  cancel() {
    if (!this.worker && !this.initializePromise) return
    this.worker?.postMessage('stop')
    this.resetWorker(abortError())
  }

  dispose() {
    if (this.disposed) return
    this.disposed = true
    this.resetWorker(abortError())
  }

  private resetWorker(error: Error) {
    if (this.activeAnalysis) {
      const active = this.activeAnalysis
      active.cleanup()
      active.reject(error)
    }

    for (const waiter of this.lineWaiters) {
      clearTimeout(waiter.timer)
      waiter.reject(error)
    }
    this.lineWaiters.clear()
    this.lineListeners.clear()

    if (this.worker) {
      this.worker.removeEventListener('message', this.handleMessage)
      this.worker.removeEventListener('error', this.handleError)
      this.worker.terminate()
    }
    this.worker = null
    this.initializePromise = null
  }
}
