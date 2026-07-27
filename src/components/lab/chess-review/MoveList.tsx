import { useState } from 'react'
import type { MoveReview } from '~/lib/lab/chess-review/types'
import { CLASSIFICATION_UI, isNotable } from './ui'

interface MoveListProps {
  moves: MoveReview[]
  selectedPly: number
  onSelect: (ply: number) => void
}

export function MoveList({ moves, selectedPly, onSelect }: MoveListProps) {
  const [filter, setFilter] = useState<'all' | 'notable'>('all')
  const visible =
    filter === 'all'
      ? moves
      : moves.filter((move) => isNotable(move.classification))

  return (
    <section
      className="overflow-hidden rounded-xl border border-line bg-white"
      aria-labelledby="move-list-title"
    >
      <div className="flex items-center justify-between border-b border-line bg-panel2 px-4 py-3">
        <h3 id="move-list-title" className="font-semibold text-ink">
          Moves
        </h3>
        <fieldset className="flex rounded-lg border border-line bg-white p-0.5">
          <legend className="sr-only">Move filter</legend>
          {(['all', 'notable'] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              aria-pressed={filter === value}
              className={`cursor-pointer rounded-md px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors ${
                filter === value
                  ? 'bg-ink text-white'
                  : 'text-muted hover:text-ink'
              }`}
            >
              {value === 'all' ? 'All' : 'Critical'}
            </button>
          ))}
        </fieldset>
      </div>

      <ul
        className="thin-scrollbar max-h-96 overflow-y-auto p-2"
        aria-label="Reviewed moves"
      >
        {visible.length === 0 ? (
          <li>
            <p className="px-3 py-8 text-center text-sm text-muted">
              No inaccuracies, mistakes, or blunders found.
            </p>
          </li>
        ) : (
          visible.map((move) => {
            const presentation = CLASSIFICATION_UI[move.classification]
            const selected = move.ply === selectedPly
            return (
              <li key={move.ply}>
                <button
                  type="button"
                  onClick={() => onSelect(move.ply)}
                  aria-current={selected ? 'step' : undefined}
                  aria-label={`Move ${move.moveNumber} ${move.color}, ${move.san}, ${presentation.label}`}
                  className={`grid w-full cursor-pointer grid-cols-[2.25rem_minmax(0,1fr)_auto] items-center gap-2 rounded-lg px-2 py-2 text-left transition-colors ${
                    selected ? 'bg-slate-900 text-white' : 'hover:bg-panel2'
                  }`}
                >
                  <span
                    className={`font-mono text-[11px] ${selected ? 'text-slate-400' : 'text-muted'}`}
                  >
                    {move.moveNumber}.{move.color === 'black' ? '..' : ''}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-mono text-sm font-semibold">
                      {move.san}
                    </span>
                    <span
                      className={`block truncate text-[10px] ${selected ? 'text-slate-400' : 'text-muted'}`}
                    >
                      {presentation.label}
                    </span>
                  </span>
                  <span
                    className={`flex h-7 min-w-7 items-center justify-center rounded-md border px-1 font-mono text-[10px] font-bold ${
                      selected
                        ? 'border-slate-600 bg-slate-800 text-white'
                        : presentation.badge
                    }`}
                    aria-hidden="true"
                  >
                    {presentation.glyph}
                  </span>
                </button>
              </li>
            )
          })
        )}
      </ul>
    </section>
  )
}
