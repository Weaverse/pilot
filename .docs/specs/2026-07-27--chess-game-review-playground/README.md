# Chess game review playground

Status: active
Created: 2026-07-27
Owner: Leo + Hermes
Route: `/lab/chess-review`

## Original request

> Làm một playground tương tự Travel Egypt: người dùng paste PGN của một ván cờ, chạy review bằng Stockfish tương tự trải nghiệm Game Review. Tách branch mới từ main, viết spec đầy đủ theo phases, test pass trước khi qua phase tiếp theo, multi commits, push, mở PR, rồi để Claude review và sửa mọi finding hợp lệ.

## Goal

Build a private-by-default, browser-only chess review experience where a visitor can paste a standard PGN and receive:

- an interactive board for every ply;
- Stockfish evaluation and best continuation for each position;
- a clear move classification and centipawn loss;
- concise, deterministic coaching text;
- a game summary with accuracy and mistake counts.

The experience should feel native to the v4 Lab rather than copying Chess.com branding, text, scoring, or visual treatment.

## Product principles

1. **Useful before clever** — explain the turning points, not every engine detail.
2. **Local by default** — PGN and engine analysis stay in the browser.
3. **Progressive workload** — the engine downloads only after the user starts a review.
4. **Transparent scoring** — labels are based on documented thresholds, not presented as Chess.com-equivalent scores.
5. **Interruptible** — long reviews expose progress and can be cancelled safely.
6. **Responsive and keyboard usable** — board, move list, and review controls work from 320px through desktop.

## User flow

1. Open `/lab/chess-review` from the Lab index or Explorer.
2. Paste a PGN or load the bundled sample.
3. Parse and validate the game locally.
4. Choose review depth: Quick (8), Balanced (12), Deep (16).
5. Start review.
6. Watch engine download/analysis progress; optionally cancel.
7. Review the summary and step through moves on the board.
8. Jump directly to inaccuracies, mistakes, and blunders.
9. Paste another PGN and start over without reloading the page.

## Functional requirements

### PGN intake

- Accept one standard chess game in PGN notation.
- Preserve common headers such as Event, Site, Date, Round, White, Black, Result, WhiteElo, and BlackElo.
- Support comments, NAGs, and clock annotations by relying on `chess.js` parsing.
- Reject malformed PGN with a useful inline error; never crash the island.
- Reject empty games and games above 240 plies to bound browser work.
- Ship one legal sample PGN so the playground is immediately testable.

### Engine

- Use Stockfish 18 lite single-thread WASM through a dedicated Web Worker.
- Load the engine only when analysis begins.
- Use UCI commands and process positions sequentially.
- Send the initial FEN plus the complete UCI move prefix for every position so Stockfish retains repetition history.
- Analyze the initial position and every resulting position (`plies + 1` total).
- Record depth, score, mate score, best move, and principal variation.
- Normalize scores to White's point of view for the graph and to the mover's point of view for centipawn loss.
- Convert mate scores to a stable bounded numeric representation only for comparison/visualization; retain the mate value for display.
- Cancel via `stop`, terminate the worker, and leave the UI in a recoverable state.
- Time out engine initialization/individual positions rather than waiting forever.

### Review model

For each played move:

- reconstruct before/after FEN and UCI notation;
- identify the engine's best move and convert it to SAN when legal;
- compare the best score before the move with the played score after it;
- calculate non-negative centipawn loss;
- classify deterministically:
  - `best`: played move matches engine best move;
  - `excellent`: loss ≤ 20 cp;
  - `good`: loss ≤ 60 cp;
  - `inaccuracy`: loss ≤ 120 cp;
  - `mistake`: loss ≤ 250 cp;
  - `blunder`: loss > 250 cp;
  - `forced`: only one legal move;
- treat transitions into or out of forced mate explicitly so centipawn thresholds do not hide mating blunders;
- generate concise text from facts: evaluation change, best alternative, and tactical/mating consequence;
- avoid unsupported claims such as “brilliant,” opening names, or human intent.

Game summary:

- average centipawn loss per side;
- deterministic accuracy estimate per side, clearly labeled as this playground's estimate;
- counts by move classification;
- largest turning point;
- final result and player/header metadata.

### Review UI

- Two states: PGN input and review workspace.
- Workspace includes:
  - responsive chessboard;
  - previous/next/start/end controls;
  - move list with move number, SAN, classification, and evaluation;
  - selected-move coaching card;
  - evaluation bar matched to the rendered board height;
  - summary cards for White and Black with a clear outcome and named move-count badges;
  - player names above and below the board, following the selected orientation;
  - a tooltip-labelled board flip control alongside the move toolbar;
  - filters/jump controls for notable moves;
  - progress and cancel controls during analysis.
- Classification badges use distinct solid colors and readable text; no review badge overlays a board square.
- A completed review opens at the first played move, regardless of the detected turning point.
- Selecting a move updates the board to the position after that move.
- ArrowLeft/ArrowRight step through moves unless focus is in a text input.
- Board coordinates and piece names remain understandable without color alone.
- Status, progress, and errors use appropriate live regions.
- Reduced-motion users do not receive forced animation.

### Lab integration

- Add a live Chess Game Review item to `/lab`.
- Add `chess-review.tsx` under the Explorer's LAB section.
- Keep all feature source collocated under:
  - `src/components/lab/chess-review/` for React/UI/client engine code;
  - `src/lib/lab/chess-review/` for pure domain code and fixtures;
  - `public/static/lab/chess-review/stockfish/` for the vendored worker, WASM, and GPL notice;
  - `src/pages/lab/chess-review.astro` for route composition.

## Non-goals

- User accounts, persisted cloud history, sharing, multiplayer, opening database, tablebases, or server-side analysis.
- Exact reproduction of Chess.com accuracy, labels, coach copy, or proprietary heuristics.
- Multiple games from one PGN file in v1.
- Chess variants, arbitrary FEN-only input, or move editing.
- “Brilliant” move detection in v1; sacrifice quality cannot be inferred reliably from a shallow browser review.

## Performance budget

- No Stockfish JS/WASM request before Start review.
- Use the ≈7 MB lite single-thread engine; do not ship the >100 MB build.
- Keep work off the main thread.
- Standard analysis targets depth 12 and reports progress per position.
- Cap a review at 240 plies.
- Do not retain large engine lines beyond the principal variation needed by the UI.

## Privacy and security

- Do not upload or persist PGN.
- Do not interpolate PGN text into HTML.
- Treat PGN headers/comments as untrusted text.
- No dynamic code evaluation or remote worker source.
- Vendored Stockfish assets are same-origin and immutable in the repository.

## Engine decision record

Validated on 2026-07-27 in a real Chromium Web Worker:

- source package: `stockfish@18.0.8` (`nmrugg/stockfish.js`);
- worker: `stockfish-18-lite-single.js` — 21,429 bytes, SHA-256 `5243fd9b276cab7dfe3ad1d43ab9ead73568fac76468c614242977a210c4a391`;
- WASM: `stockfish-18-lite-single.wasm` — 7,295,411 bytes, SHA-256 `a8fbc05ec6920b56d7485826dcb02c5ffd2826bcbf751cf973046f237a9096f1`;
- proof sequence: `uci` → `uciok` → `isready` → `readyok` → `position startpos` → `go depth 6`;
- proof result: depth info received and legal `bestmove e2e4` returned;
- no cross-origin isolation is required for this single-thread build.

## Licensing

- Stockfish.js / Stockfish 18 is GPL-3.0.
- Keep its worker/WASM separate from application source.
- Include `Copying.txt` and a notice linking the exact upstream source/version.
- The site remains MIT; modifications to the vendored GPL engine, if any, must be published under GPL-3.0.
- `chess.js` is BSD-2-Clause; `react-chessboard` is MIT.

## Acceptance criteria

- A valid sample PGN produces a complete review in a real browser.
- An invalid PGN produces a clear inline error and no worker.
- Every engine request is sequential, cancellable, and bounded.
- Move classifications are unit-tested around every threshold and mate transition.
- Board/move navigation matches reconstructed FENs.
- Mobile has no horizontal page overflow at 320px, 390px, and 768px.
- Desktop shell, mobile drawers, and status bar do not regress.
- Engine is not requested until Start review.
- Full tests, Astro check, build, Biome, and browser QA pass.
- Claude reviews the complete branch against `origin/main`; every accepted blocker is fixed and reverified.
