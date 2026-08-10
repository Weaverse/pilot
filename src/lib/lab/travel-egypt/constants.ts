import type { Mode } from './types'

/** Public base path for every Travel Egypt asset. */
export const ASSET_BASE = '/lab/travel-egypt'

export const TOTAL_LEVELS = 8

/** Levels 1–4 use a 4×4 board; levels 5–8 use a 5×5 board (mirrors the original). */
export const SMALL_GRID = 4
export const LARGE_GRID = 5
export const LARGE_GRID_FROM_LEVEL = 5

/** Random shuffle-move counts per mode, keyed by grid size (mirrors the original). */
export const SHUFFLE_MOVES: Record<number, Record<Mode, number>> = {
  [SMALL_GRID]: { easy: 20, medium: 40, hard: 60 },
  [LARGE_GRID]: { easy: 30, medium: 50, hard: 70 },
}

export const MODES: Mode[] = ['easy', 'medium', 'hard']

export const MODE_LABEL: Record<Mode, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
}

/** Slide-animation duration, kept in sync with the CSS transition on tiles. */
export const SLIDE_MS = 160

export const SOURCE_REPO = 'https://github.com/hta218/Travel_Egypt'
