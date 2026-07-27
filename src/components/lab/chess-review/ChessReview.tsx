import { useState } from 'react'
import { SAMPLE_PGN } from '~/lib/lab/chess-review/sample'
import { PgnInput } from './PgnInput'
import { ReviewWorkspace } from './ReviewWorkspace'
import './chess-review.css'
import { useChessReview } from './use-chess-review'

export default function ChessReview() {
  const [pgn, setPgn] = useState('')
  const [depth, setDepth] = useState(8)
  const review = useChessReview()

  if (review.status === 'ready' && review.review) {
    return <ReviewWorkspace review={review.review} onNewReview={review.reset} />
  }

  return (
    <div className="chess-review-root">
      <PgnInput
        pgn={pgn}
        depth={depth}
        status={review.status}
        progress={review.progress}
        error={review.error}
        onPgnChange={setPgn}
        onDepthChange={setDepth}
        onLoadSample={() => setPgn(SAMPLE_PGN)}
        onSubmit={() => void review.start(pgn, depth)}
        onCancel={review.cancel}
      />
    </div>
  )
}
