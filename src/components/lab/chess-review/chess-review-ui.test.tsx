// @ts-nocheck -- Bun test globals are outside the Astro tsconfig.
import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { parsePgn } from '~/lib/lab/chess-review/pgn'
import { buildGameReview } from '~/lib/lab/chess-review/review'
import { EvaluationBar } from './EvaluationBar'
import { GameSummary } from './GameSummary'
import { MoveList } from './MoveList'
import { MoveReviewPanel } from './MoveReviewPanel'
import { PgnInput } from './PgnInput'
import { boardMotionOptions } from './ReviewBoard'
import { ReviewWorkspace } from './ReviewWorkspace'

function noop() {}

function reviewFixture() {
  const game = parsePgn(`[Event "UI test"]
[White "Ada"]
[Black "Grace"]
[Result "1-0"]

1. e4 e5 2. Nf3`)
  const fens = [game.initialFen, ...game.moves.map((move) => move.afterFen)]
  const positions = fens.map((fen, index) => ({
    fen,
    depth: 8,
    score: { type: 'cp' as const, value: 0 },
    bestMove: game.moves[index]?.uci ?? '(none)',
    pv: game.moves[index] ? [game.moves[index].uci] : [],
  }))
  return buildGameReview(game, positions)
}

describe('chess review input UI', () => {
  test('renders an accessible local-first PGN form', () => {
    const html = renderToStaticMarkup(
      <PgnInput
        pgn=""
        depth={8}
        status="idle"
        progress={null}
        error={null}
        onPgnChange={noop}
        onDepthChange={noop}
        onLoadSample={noop}
        onSubmit={noop}
        onCancel={noop}
      />,
    )

    expect(html).toContain('for="chess-review-pgn"')
    expect(html).toContain('id="chess-review-depth"')
    expect(html).toContain('Load sample')
    expect(html).toContain('Your PGN never leaves this browser')
    expect(html).toContain('disabled=""')
  })

  test('announces analysis progress and exposes cancellation', () => {
    const html = renderToStaticMarkup(
      <PgnInput
        pgn="1. e4"
        depth={8}
        status="analyzing"
        progress={{ completed: 1, total: 2, currentPly: 1 }}
        error={null}
        onPgnChange={noop}
        onDepthChange={noop}
        onLoadSample={noop}
        onSubmit={noop}
        onCancel={noop}
      />,
    )

    expect(html).toContain('Cancel review')
    expect(html).toContain('Analyzing move 1 (White) · position 2 of 2')
    expect(html).toContain('aria-live="polite"')
    expect(html).toContain('50%')
  })
})

describe('chess review result UI', () => {
  test('renders summary, semantic move list, selected coaching, and evaluation meter', () => {
    const review = reviewFixture()
    const summary = renderToStaticMarkup(<GameSummary review={review} />)
    const moves = renderToStaticMarkup(
      <MoveList moves={review.moves} selectedPly={1} onSelect={noop} />,
    )
    const coaching = renderToStaticMarkup(
      <MoveReviewPanel move={review.moves[0]} position={review.positions[0]} />,
    )
    const evaluation = renderToStaticMarkup(<EvaluationBar evaluation={35} />)
    const workspace = renderToStaticMarkup(
      <ReviewWorkspace review={review} onNewReview={noop} />,
    )

    expect(summary).toContain('Ada')
    expect(summary).toContain('Grace')
    expect(summary).toContain('local estimate')
    expect(moves).toContain('<ul')
    expect(moves).toContain('aria-current="step"')
    expect(moves).toContain('Move 1 white, e4, Best')
    expect(coaching).toContain('Best move in the position')
    expect(coaching).toContain('White’s perspective')
    expect(evaluation).toContain('<meter')
    expect(evaluation).toContain('Position evaluation +0.3')
    expect(workspace).toContain('aria-label="Chess review workspace"')
    expect(workspace).toContain(
      'aria-keyshortcuts="ArrowLeft ArrowRight Home End"',
    )
    expect(workspace).toContain('inert=""')
    expect(boardMotionOptions(true)).toEqual({
      animationDurationInMs: 0,
      showAnimations: false,
    })
  })
})

describe('playground registration', () => {
  test('registers a client-only route in both Lab and Explorer', () => {
    const route = readFileSync('src/pages/lab/chess-review.astro', 'utf8')
    const lab = readFileSync('src/pages/lab/index.astro', 'utf8')
    const sidebar = readFileSync(
      'src/components/studio/studio-shell/Sidebar.astro',
      'utf8',
    )

    expect(route).toContain('<ChessReview client:only="react" />')
    expect(route).toContain('active="/lab/chess-review"')
    expect(lab).toContain("href: '/lab/chess-review'")
    expect(sidebar).toContain('href="/lab/chess-review"')
    expect(sidebar).toContain('chess-review.tsx')
  })
})
