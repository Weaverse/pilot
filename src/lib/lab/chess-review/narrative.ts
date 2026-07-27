import type { MoveClassification } from './types'

const LABELS: Record<MoveClassification, string> = {
  forced: 'Forced',
  best: 'Best',
  excellent: 'Excellent',
  good: 'Good',
  inaccuracy: 'Inaccuracy',
  mistake: 'Mistake',
  blunder: 'Blunder',
}

export function classificationLabel(
  classification: MoveClassification,
): string {
  return LABELS[classification]
}

function formatLoss(centipawnLoss: number): string {
  return `${(centipawnLoss / 100).toFixed(1)} pawns`
}

export function moveNarrative(options: {
  classification: MoveClassification
  centipawnLoss: number
  bestMoveSan: string | null
  mateDistanceLoss: 'slower-win' | 'faster-loss' | null
}): string {
  const { classification, centipawnLoss, bestMoveSan, mateDistanceLoss } =
    options

  if (classification === 'forced') return 'This was the only legal move.'
  if (classification === 'best') return 'Best move in the position.'
  if (classification === 'excellent') {
    return 'Excellent move. It keeps nearly all of the position’s value.'
  }

  const alternative = bestMoveSan
    ? ` ${bestMoveSan} was the engine’s top choice.`
    : ''

  if (mateDistanceLoss === 'slower-win') {
    return `This still forces mate, but takes longer.${alternative}`
  }
  if (mateDistanceLoss === 'faster-loss') {
    return `This allows the opponent to force mate sooner.${alternative}`
  }

  if (classification === 'good') {
    return `A solid move with only a small concession.${alternative}`
  }
  if (classification === 'inaccuracy') {
    return `This gives away about ${formatLoss(centipawnLoss)}.${alternative}`
  }
  if (classification === 'mistake') {
    return `This loses about ${formatLoss(centipawnLoss)} and shifts the position.${alternative}`
  }

  if (classification === 'blunder' && centipawnLoss >= 50_000) {
    return `A critical error that changes a forced-mate outcome.${alternative}`
  }

  return `A critical error that loses about ${formatLoss(centipawnLoss)}.${alternative}`
}
