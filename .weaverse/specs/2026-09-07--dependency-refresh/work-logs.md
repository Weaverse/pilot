# Work Logs

## 2026-09-07 — @hta218

- Established the baseline on Node.js 24.20.0 rather than the machine's
  Node.js 26 default, matching the July 2026 refresh.
- Updated the six range-permitted packages with `npm update`; `package.json`
  was untouched and only the lockfile moved.
- Confirmed the upgraded Biome release introduces no formatting change, so the
  commit stays lockfile-only.
- Bumped the five exact-pinned minor releases and reinstalled.
- `npm test` dropped to 190 passing after the Playwright bump. Cause was the
  browser revision, not the code: three tests in
  `tests/unit/api-locale-boundary.test.ts` launch a real Chromium, and
  Playwright asks for `npx playwright install` after an upgrade.
- After installing the browser, one of those three still failed on the config's
  5-second timeout, then passed in isolation. Three consecutive full runs were
  193 passing, so the single failure was cold-start browser launch, not a
  regression.
- Re-ran codegen against GraphQL Code Generator 7.4.0; the generated types are
  unchanged.
- Smoke-tested the dev server: `/collections`, `/cart`, and `/products` all
  return 200, with no errors in the server log.

### Deferred

TypeScript 7, GraphQL 17, and React Router 8 stay out of this refresh. The
React Router deferral is the reason Pilot still carries five open Dependabot
alerts; their minimum fix is `7.18.3`, and `@shopify/hydrogen@2026.4.5` still
declares peer `react-router: ~7.16.0`.
