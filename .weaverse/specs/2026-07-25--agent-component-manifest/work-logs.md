# Work Logs

## 2026-07-25 — Implementation

### Dependency blocker

Probed a clean Pilot install against `@weaverse/hydrogen@5.18.0`:

```
error TS2353: 'sensitive' does not exist in type 'BasicInput'.
```

Root cause: hydrogen `5.18.0` pinned `@weaverse/schema` at exactly `0.12.0`,
predating the manifest work. Forcing `0.13.0` through npm `overrides` made the
probe pass, confirming the code was fine and only the pin was stale.

Rejected the override as a fix — Pilot is the reference theme, so the broken pin
would propagate to every downstream theme. Released
`@weaverse/hydrogen@5.19.0` upstream (pinning schema `0.13.0`) and moved Pilot
to `^5.19.0`.

### Duplicate registrations

Confirmed the defect predicted by the issue: 84 registry entries, 82 unique.
`Blogs` and `BlogPost` were each listed twice. Removed the second pair.

The SDK generator independently refuses to serialize duplicates, verified by
reintroducing one:

```
Error: Duplicate component type: blogs
```

So this is now structurally impossible to reintroduce silently.

### Non-deterministic manifest

First two generator runs produced different bytes. Diff isolated a single field:

```
< "defaultValue": 1785043618655
> "defaultValue": 1785043619668
```

`app/sections/countdown/timer.tsx` computed its schema default from
`new Date()` at module load, so every load produced a different manifest. That
makes a drift check structurally impossible, not merely noisy.

Moved the fallback into the component: `useState(() => Date.now() + ONE_DAY)`,
stable for the instance lifetime, with the schema default removed.

This surfaced a latent bug. Previously an unset `endTime` produced
`undefined - Date.now()` → `NaN`, and every `NaN <= 0` comparison is false, so
the timer rendered garbage rather than zeros. Added a `Number.isFinite` guard.
Verified across unset, past, future, and `NaN` inputs.

### Provenance revision

First implementation stamped `git rev-parse HEAD` into the artifact. That is
self-invalidating: committing the manifest changes HEAD, so the committed file
immediately disagrees with its own revision and `--check` fails on every commit.

Switched the default to the theme version (`v2026.7.22`), which changes only on
release. Deployment pipelines needing exact-SHA binding pass `--revision`.

### Module resolution

Vite SSR initially failed:

```
ERR_PACKAGE_PATH_NOT_EXPORTED: No "exports" main defined in @weaverse/schema
```

`@weaverse/hydrogen` ships a CommonJS `main` that `require`s the ESM-only
`@weaverse/schema`. Node externalization hit that broken CJS path. Added
`ssr.noExternal: [/^@weaverse\//]` so Vite resolves the ESM entrypoints, which
matches how the storefront actually builds.

### Audit heuristic tuning

The first `SUSPICIOUS_NAME` pattern matched bare `auth`, flagging Pilot's
`authorName`, `authorTitle`, `authorImage`, and `showAuthor` content fields.
Allowlisting four legitimate fields would have trained reviewers to ignore the
check, so the pattern was tightened to spelled-out credential terms
(`auth_token`, `authorization`, and similar).

Only one genuine exception remains: `popularSearchKeywords`, recorded in
`REVIEWED_SAFE` with justification.

### Secret-value detector bug

Wrote a tampered manifest containing `sk_live_AAAABBBBCCCCDDDD` in a nested
preset array; the audit passed. My own regex excluded `_` from the body, so it
matched `sk_AAAA…` but not the far more common segmented `sk_live_…` form.

Fixed the character class and added Shopify (`shpat_`) and JWT shapes. Verified
against a 10-case table covering both true and false positives before re-running
the tampered fixture, which now fails correctly at
`presets` path `nested.deep[1]`.

### Biome and the canonical artifact

Biome reformatted `.weaverse/component-manifest.json`, which would corrupt the
canonical bytes and invalidate the hash.

First attempt added `files.includes`, which **replaces** rather than merges the
inherited list — warnings jumped from 3 to 100. Restating all 24 inherited
patterns worked but was fragile, and adding a leading `**` tripped
`noBiomeFirstException`.

Settled on a scoped `overrides` entry disabling the formatter and linter for
that one path, leaving the shared config untouched. Verified load-bearing:
removing it reintroduces 2 errors.

### CI

Pilot had no PR workflow at all — only a manually dispatched Claude review.

Before enabling gates, cloned unmodified `main` and confirmed typecheck and
Biome already pass (3 warnings, 0 errors), so the new workflow is green on
arrival rather than importing pre-existing debt.

## Verification

| Check | Result |
| --- | --- |
| `npm run typecheck` | pass |
| `npm run biome` | 3 warnings, 0 errors (matches baseline) |
| `npm run weaverse:manifest:check` | up to date, 82 components |
| `npm run weaverse:audit` | pass, 82 components, 489 settings |
| Regenerate twice | byte-identical, same hash |
| Duplicate registration | generator rejects |
| Unmarked credential on registered component | audit fails |
| Same setting marked `sensitive` | audit passes, value absent from manifest |
| Secret in nested preset array | audit fails with exact path |
| Tampered manifest | drift check fails |
| Countdown unset/past/future/NaN | correct in all four cases |

Final manifest hash:
`sha256:d075f0d922f2cedcdb395cba93ee4d5a99d967015f7b9730c3d591ec81056ca5`
