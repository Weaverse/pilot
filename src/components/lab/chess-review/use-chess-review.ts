import { useCallback, useEffect, useRef, useState } from 'react'
import { parsePgn } from '~/lib/lab/chess-review/pgn'
import type {
  AnalysisProgress,
  GameReview,
  ParsedGame,
} from '~/lib/lab/chess-review/types'
import { analyzeGame } from './analyze-game'
import { StockfishClient } from './stockfish-client'

export type ChessReviewStatus =
  | 'idle'
  | 'parsing'
  | 'loading-engine'
  | 'analyzing'
  | 'ready'
  | 'error'
  | 'cancelled'

export interface ChessReviewState {
  status: ChessReviewStatus
  game: ParsedGame | null
  review: GameReview | null
  progress: AnalysisProgress | null
  error: string | null
}

const INITIAL_STATE: ChessReviewState = {
  status: 'idle',
  game: null,
  review: null,
  progress: null,
  error: null,
}

type ClientFactory = () => StockfishClient
const defaultClientFactory: ClientFactory = () => new StockfishClient()

export function useChessReview(
  clientFactory: ClientFactory = defaultClientFactory,
) {
  const [state, setState] = useState<ChessReviewState>(INITIAL_STATE)
  const clientRef = useRef<StockfishClient | null>(null)
  const controllerRef = useRef<AbortController | null>(null)
  const runRef = useRef(0)

  const cancel = useCallback(() => {
    controllerRef.current?.abort()
    clientRef.current?.cancel()
  }, [])

  const reset = useCallback(() => {
    cancel()
    runRef.current += 1
    setState(INITIAL_STATE)
  }, [cancel])

  const start = useCallback(
    async (pgn: string, depth: number) => {
      cancel()
      const run = runRef.current + 1
      runRef.current = run
      setState({ ...INITIAL_STATE, status: 'parsing' })

      let game: ParsedGame
      try {
        game = parsePgn(pgn)
      } catch (error) {
        if (run !== runRef.current) return
        setState({
          ...INITIAL_STATE,
          status: 'error',
          error: error instanceof Error ? error.message : String(error),
        })
        return
      }

      const controller = new AbortController()
      const client = clientFactory()
      controllerRef.current = controller
      clientRef.current = client
      setState({
        ...INITIAL_STATE,
        status: 'loading-engine',
        game,
      })

      try {
        await client.initialize()
        if (controller.signal.aborted) {
          throw new DOMException('Chess analysis was cancelled.', 'AbortError')
        }
        setState({
          ...INITIAL_STATE,
          status: 'analyzing',
          game,
        })

        const review = await analyzeGame(game, client, {
          depth,
          signal: controller.signal,
          onProgress: (progress) => {
            if (run !== runRef.current) return
            setState((current) => ({ ...current, progress }))
          },
        })

        if (run === runRef.current) {
          setState({
            status: 'ready',
            game,
            review,
            progress: null,
            error: null,
          })
        }
      } catch (error) {
        if (run !== runRef.current) return
        const cancelled =
          error instanceof DOMException && error.name === 'AbortError'
        setState({
          status: cancelled ? 'cancelled' : 'error',
          game,
          review: null,
          progress: null,
          error: cancelled
            ? null
            : error instanceof Error
              ? error.message
              : String(error),
        })
      } finally {
        client.dispose()
        if (clientRef.current === client) clientRef.current = null
        if (controllerRef.current === controller) controllerRef.current = null
      }
    },
    [cancel, clientFactory],
  )

  useEffect(
    () => () => {
      runRef.current += 1
      controllerRef.current?.abort()
      clientRef.current?.dispose()
    },
    [],
  )

  return {
    ...state,
    isBusy:
      state.status === 'parsing' ||
      state.status === 'loading-engine' ||
      state.status === 'analyzing',
    start,
    cancel,
    reset,
  }
}
