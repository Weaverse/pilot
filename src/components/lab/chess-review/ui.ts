import type { MoveClassification } from '~/lib/lab/chess-review/types'

interface ClassificationPresentation {
  label: string
  glyph: string
  badge: string
  dot: string
}

export const CLASSIFICATION_UI: Record<
  MoveClassification,
  ClassificationPresentation
> = {
  forced: {
    label: 'Forced',
    glyph: '=',
    badge: 'border-violet-200 bg-violet-50 text-violet-700',
    dot: 'bg-violet-500',
  },
  best: {
    label: 'Best',
    glyph: '★',
    badge: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    dot: 'bg-emerald-500',
  },
  excellent: {
    label: 'Excellent',
    glyph: '✓',
    badge: 'border-cyan-200 bg-cyan-50 text-cyan-700',
    dot: 'bg-cyan-500',
  },
  good: {
    label: 'Good',
    glyph: '·',
    badge: 'border-slate-200 bg-slate-50 text-slate-600',
    dot: 'bg-slate-400',
  },
  inaccuracy: {
    label: 'Inaccuracy',
    glyph: '?!',
    badge: 'border-amber-200 bg-amber-50 text-amber-700',
    dot: 'bg-amber-500',
  },
  mistake: {
    label: 'Mistake',
    glyph: '?',
    badge: 'border-orange-200 bg-orange-50 text-orange-700',
    dot: 'bg-orange-500',
  },
  blunder: {
    label: 'Blunder',
    glyph: '??',
    badge: 'border-red-200 bg-red-50 text-red-700',
    dot: 'bg-red-500',
  },
}

export function formatEvaluation(centipawns: number): string {
  if (Math.abs(centipawns) >= 50_000) return centipawns > 0 ? '+M' : '−M'
  const pawns = centipawns / 100
  return `${pawns >= 0 ? '+' : '−'}${Math.abs(pawns).toFixed(1)}`
}

export function evaluationPercent(centipawns: number): number {
  if (centipawns >= 50_000) return 96
  if (centipawns <= -50_000) return 4
  const percent = 100 / (1 + Math.exp(-centipawns / 350))
  return Math.min(96, Math.max(4, percent))
}

export function isNotable(classification: MoveClassification): boolean {
  return (
    classification === 'inaccuracy' ||
    classification === 'mistake' ||
    classification === 'blunder'
  )
}

export function uciSquares(uci: string): [string, string] | null {
  const match = /^([a-h][1-8])([a-h][1-8])/.exec(uci)
  return match ? [match[1], match[2]] : null
}
