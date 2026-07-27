# Implementation plan

Each phase is gated. Do not begin the next phase until its focused tests, Astro check, and formatting checks pass. Commit each completed phase independently.

## Phase 0 — specification and engine proof

Deliverables:

- accepted scope and architecture in `README.md`;
- exact dependency/build choices;
- proof that Stockfish 18 lite single-thread starts in a real browser worker and returns a legal `bestmove`;
- GPL notice and corresponding-source link strategy.

Verification:

```bash
bun run check
bunx @biomejs/biome check <touched source files>
git diff --check
```

Commit:

```text
docs: specify chess game review playground
```

## Phase 1 — PGN and engine foundation

Dependencies:

- `chess.js@1.4.0` for legal move/PGN/FEN handling;
- `react-chessboard@5.10.0` for the visual board;
- vendored Stockfish.js 18 lite single-thread worker/WASM assets from `stockfish@18.0.8`.

Pure domain modules under `src/lib/lab/chess-review/`:

- `types.ts` — stable feature contracts;
- `pgn.ts` — parse one game, sanitize metadata, enforce ply cap, produce before/after FEN and SAN/UCI records;
- `score.ts` — UCI score parsing and White/mover normalization;
- `sample.ts` — bundled legal sample PGN.

Client modules under `src/components/lab/chess-review/`:

- `stockfish-client.ts` — UCI lifecycle, sequential analysis, timeout, stop/dispose;
- `stockfish-protocol.ts` — pure parsing of `info`/`bestmove` lines. The client owns one canonical same-origin asset path.

Tests:

- valid PGN with headers/comments;
- malformed and zero-ply PGN;
- 240-ply cap boundary;
- SAN/UCI/FEN reconstruction including castling, promotion, and en passant;
- cp/mate UCI parsing and normalization;
- protocol ignores stale/malformed lines and retains the deepest complete result;
- mocked worker initialization, sequential command order, timeout, cancellation, and cleanup.

Gate:

```bash
bun test src/lib/lab/chess-review src/components/lab/chess-review
bun run check
bunx @biomejs/biome check <phase files>
git diff --check
```

Commit:

```text
feat: add browser chess analysis foundation
```

## Phase 2 — review pipeline and scoring

Modules:

- `classify.ts` — deterministic move labels and thresholds;
- `review.ts` — convert position analyses into per-move reviews and side summaries;
- `narrative.ts` — factual coach sentences;
- `analyze-game.ts` — N+1 position orchestration, progress, cancellation, and result assembly;
- `use-chess-review.ts` — React state machine for idle/parsing/loading/analyzing/ready/error/cancelled.

Rules:

- Scores from Stockfish are relative to side to move.
- Store graph evaluation from White's perspective.
- For a mover, `playedScore = -afterScore`; loss is `max(0, bestBefore - playedScore)`.
- Mate scores remain typed values and use explicit mate transition classification.
- Accuracy is a documented local estimate, not Chess.com accuracy.

Tests:

- exact threshold boundaries;
- played best move override;
- only-legal-move classification;
- missed mate, allowed mate, and delayed mate;
- no negative centipawn loss;
- White/Black score orientation;
- side summaries and largest turning point;
- deterministic narrative facts;
- N+1 engine calls, progress count, cancellation, and partial-result rejection.

Gate:

```bash
bun test src/lib/lab/chess-review src/components/lab/chess-review
bun run check
bunx @biomejs/biome check <phase files>
git diff --check
```

Commit:

```text
feat: generate deterministic chess game reviews
```

## Phase 3 — playground experience

Files:

- `ChessReview.tsx` — top-level state composition;
- `PgnInput.tsx` — form, depth options, sample action, validation, engine progress, and cancellation;
- `ReviewWorkspace.tsx` — selected-ply state and shared button/keyboard navigation;
- `ReviewBoard.tsx` — responsive read-only board and coordinates;
- `MoveList.tsx` — grouped plies and classification badges;
- `MoveReviewPanel.tsx` — selected move coaching facts and PV;
- `GameSummary.tsx` — player accuracy/ACPL/counts;
- `EvaluationBar.tsx` — accessible evaluation visualization;
- `navigation.ts`, `ui.ts`, and `chess-review.css` — collocated navigation and presentation helpers;
- `src/pages/lab/chess-review.astro` — route;
- Lab index and Explorer entries.

Interaction requirements:

- Start is disabled while PGN is empty or analysis is active.
- Submit parses before the engine is loaded.
- Progress names the current move and completed/total positions.
- Cancel terminates analysis and allows retry.
- Previous/next/home/end and move-row selection update one canonical selected ply.
- Arrow keys ignore textarea/input/select targets.
- On mobile: board first, summary and selected review next, move list below; no fixed-width overflow.
- On desktop: board/review and move list form a balanced two-column workspace.
- Classification uses text/icon plus color.

Component tests/source assertions:

- accessible form labels and errors;
- progress live region and cancel control;
- navigation boundary behavior;
- notable-move filtering;
- route and Lab/Explorer registration.

Browser QA:

- 320×640, 390×844, 768×900, 1024×768, 1440×900;
- keyboard-only form and move navigation;
- reduced-motion media query;
- no engine network request before Start;
- real sample PGN review at Quick depth;
- cancel mid-review and retry;
- invalid PGN path;
- Astro soft navigation away/back;
- no console errors or horizontal overflow.

Gate:

```bash
bun test
bun run check
bun run build
bunx @biomejs/biome check <all touched source files>
git diff --check
```

Commit:

```text
feat: add chess game review playground
```

## Phase 4 — final hardening and external review

Local verification:

- run full test/check/build from a clean tree;
- verify generated build does not dirty tracked files;
- safe added-line secret/debug scan;
- verify vendored asset checksums and upstream/version notice;
- inspect production bundle/network behavior;
- verify exact browser QA matrix.

Claude review:

- run Claude read-only against `origin/main...HEAD`;
- include this spec, changed files, verification evidence, and browser observations;
- require exact file/line evidence and `APPROVE` or `CHANGES_REQUIRED`;
- independently reproduce every accepted finding;
- fix only concrete in-scope issues;
- rerun focused/full checks and a second Claude pass after changes.

Possible review-fix commit:

```text
fix: harden chess review interactions
```

Local verification completed on 2026-07-27:

- `bun test`: 56 pass, 0 fail;
- `bun run check`: 0 errors, warnings, or hints;
- `bun run build`, focused Biome, and `git diff --check`: pass;
- real Stockfish sample review selected `Nf6` as a blunder;
- invalid PGN, cancellation, retry, filters, and keyboard navigation: pass;
- viewport matrix `320×640`, `390×844`, `768×900`, `1024×768`, and `1440×900`: no horizontal overflow or clipped navigation;
- reduced-motion emulation and Astro navigation away/back: pass;
- no Stockfish binary request before Start and no review POST/API request;
- vendored and built JS/WASM SHA-256 values match;
- exact npm `gitHead`, Stockfish 18 source, and GPL URLs resolve;
- added-line credential scan: no findings (`gitleaks` and `trufflehog` were unavailable, so the documented regex fallback was used).

## Phase 5 — delivery

1. Push `feat/playground-chess-game-review`.
2. Open a PR to `main` with phase/verification evidence and licensing note.
3. Wait for Vercel checks.
4. Resolve immutable deployment URL for exact PR HEAD.
5. Repeat smoke QA on deployed preview, including a real Quick review.
6. Send issue/spec path, PR, preview, commits, verification results, and screenshots to Leo.
7. Do not merge until Leo approves the preview.
