export type ReviewNavigationKey = 'ArrowLeft' | 'ArrowRight' | 'Home' | 'End'

export function clampPly(ply: number, maxPly: number): number {
  return Math.max(0, Math.min(maxPly, ply))
}

export function navigatePly(
  currentPly: number,
  key: ReviewNavigationKey,
  maxPly: number,
): number {
  if (key === 'Home') return 0
  if (key === 'End') return maxPly
  return clampPly(currentPly + (key === 'ArrowLeft' ? -1 : 1), maxPly)
}

export function isReviewNavigationKey(key: string): key is ReviewNavigationKey {
  return (
    key === 'ArrowLeft' ||
    key === 'ArrowRight' ||
    key === 'Home' ||
    key === 'End'
  )
}
