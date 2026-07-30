import {
  AlertCircleIcon,
  AlertDiamondIcon,
  CancelCircleIcon,
  CheckmarkCircle02Icon,
  EqualSignIcon,
  StarIcon,
  ThumbsUpIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import type { MoveClassification } from '~/lib/lab/chess-review/types'

const CLASSIFICATION_ICONS = {
  forced: EqualSignIcon,
  best: StarIcon,
  excellent: CheckmarkCircle02Icon,
  good: ThumbsUpIcon,
  inaccuracy: AlertCircleIcon,
  mistake: AlertDiamondIcon,
  blunder: CancelCircleIcon,
} as const

interface ClassificationIconProps {
  classification: MoveClassification
  size?: number
}

export function ClassificationIcon({
  classification,
  size = 16,
}: ClassificationIconProps) {
  return (
    <span className="inline-flex shrink-0" aria-hidden="true">
      <HugeiconsIcon
        icon={CLASSIFICATION_ICONS[classification]}
        size={size}
        strokeWidth={2.1}
      />
    </span>
  )
}
