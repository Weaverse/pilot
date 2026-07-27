import { PlayIcon, RefreshIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import type { AnalysisProgress } from '~/lib/lab/chess-review/types'
import type { ChessReviewStatus } from './use-chess-review'

interface PgnInputProps {
  pgn: string
  depth: number
  status: ChessReviewStatus
  progress: AnalysisProgress | null
  error: string | null
  onPgnChange: (value: string) => void
  onDepthChange: (value: number) => void
  onLoadSample: () => void
  onSubmit: () => void
  onCancel: () => void
}

function progressLabel(
  status: ChessReviewStatus,
  progress: AnalysisProgress | null,
): string {
  if (status === 'parsing') return 'Validating PGN…'
  if (status === 'loading-engine') return 'Loading Stockfish in your browser…'
  if (status === 'analyzing' && progress) {
    return `Analyzing position ${Math.min(progress.completed + 1, progress.total)} of ${progress.total}`
  }
  return 'Preparing review…'
}

export function PgnInput(props: PgnInputProps) {
  const busy =
    props.status === 'parsing' ||
    props.status === 'loading-engine' ||
    props.status === 'analyzing'
  const percent = props.progress
    ? Math.round((props.progress.completed / props.progress.total) * 100)
    : 0

  function submit(event: { preventDefault(): void }) {
    event.preventDefault()
    if (!busy && props.pgn.trim()) props.onSubmit()
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-[0_24px_60px_-42px_rgba(15,23,42,0.65)]">
      <div className="relative overflow-hidden bg-slate-950 px-5 py-7 text-white sm:px-8 sm:py-9">
        <div
          className="absolute inset-0 opacity-20 [background-image:linear-gradient(45deg,#334155_25%,transparent_25%),linear-gradient(-45deg,#334155_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#334155_75%),linear-gradient(-45deg,transparent_75%,#334155_75%)] [background-position:0_0,0_16px,16px_-16px,-16px_0] [background-size:32px_32px]"
          aria-hidden="true"
        />
        <div className="relative max-w-2xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-emerald-300">
            Local engine · Private by default
          </p>
          <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
            Turn a PGN into a move-by-move review.
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
            Paste one game. Stockfish runs on this device, scores every
            position, and points out the moves that changed the game.
          </p>
        </div>
      </div>

      <form className="p-5 sm:p-7" onSubmit={submit}>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <label
              htmlFor="chess-review-pgn"
              className="font-semibold text-ink"
            >
              Game PGN
            </label>
            <p id="chess-review-pgn-help" className="mt-1 text-xs text-muted">
              One standard PGN, up to 240 plies. Comments and headers are fine.
            </p>
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={props.onLoadSample}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-line px-3 py-2 font-mono text-xs text-slate-600 transition-colors hover:border-slate-400 hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            <HugeiconsIcon icon={RefreshIcon} size={14} strokeWidth={1.8} />
            Load sample
          </button>
        </div>

        <textarea
          id="chess-review-pgn"
          value={props.pgn}
          disabled={busy}
          onChange={(event) => props.onPgnChange(event.target.value)}
          aria-describedby="chess-review-pgn-help"
          aria-invalid={props.status === 'error'}
          placeholder={
            '[Event "Casual game"]\n[White "Leo"]\n[Black "Opponent"]\n\n1. e4 e5 2. Nf3 Nc6 …'
          }
          className="mt-3 min-h-56 w-full resize-y rounded-xl border border-line bg-panel2 p-4 font-mono text-[13px] leading-6 text-ink outline-none transition focus:border-emerald-500 focus:ring-3 focus:ring-emerald-100 disabled:cursor-wait disabled:opacity-70"
        />

        {props.error && (
          <div
            role="alert"
            className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {props.error}
          </div>
        )}
        {props.status === 'cancelled' && (
          <div
            role="status"
            className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800"
          >
            Review cancelled. Your PGN is still here when you want to retry.
          </div>
        )}

        <div className="mt-5 flex flex-col gap-4 border-t border-line pt-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <label
              htmlFor="chess-review-depth"
              className="text-sm font-semibold text-ink"
            >
              Engine strength
            </label>
            <select
              id="chess-review-depth"
              value={props.depth}
              disabled={busy}
              onChange={(event) =>
                props.onDepthChange(Number(event.target.value))
              }
              className="mt-2 block w-full cursor-pointer rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-emerald-500 focus:ring-3 focus:ring-emerald-100 disabled:cursor-wait sm:w-52"
            >
              <option value={8}>Quick · depth 8</option>
              <option value={12}>Balanced · depth 12</option>
              <option value={16}>Deep · depth 16</option>
            </select>
          </div>

          {busy ? (
            <button
              type="button"
              onClick={props.onCancel}
              className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-red-200 bg-red-50 px-5 py-2.5 font-semibold text-red-700 transition-colors hover:bg-red-100"
            >
              Cancel review
            </button>
          ) : (
            <button
              type="submit"
              disabled={!props.pgn.trim()}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-ink px-5 py-2.5 font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
            >
              <HugeiconsIcon icon={PlayIcon} size={17} strokeWidth={2} />
              Review game
            </button>
          )}
        </div>

        {busy && (
          <div className="mt-5" role="status" aria-live="polite">
            <div className="flex items-center justify-between gap-4 font-mono text-xs text-muted">
              <span>{progressLabel(props.status, props.progress)}</span>
              <span>{percent}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-emerald-500 transition-[width] duration-200 motion-reduce:transition-none"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        )}

        <p className="mt-5 text-xs leading-5 text-muted">
          The 7.3 MB Stockfish engine is downloaded only after you start. Your
          PGN never leaves this browser. Accuracy is a local estimate, not a
          Chess.com score.
        </p>
      </form>
    </div>
  )
}
