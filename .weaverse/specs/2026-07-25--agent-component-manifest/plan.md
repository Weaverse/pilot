# Plan

## Approach

Load the real registry through Vite's SSR module runner, hand the resulting
schemas to `generateComponentManifest()` from `@weaverse/schema/manifest`, and
write the canonical bytes to `.weaverse/component-manifest.json`.

Loading through Vite rather than parsing source keeps the generator honest: it
sees exactly what the storefront registers, including `~/` aliases, TypeScript,
and JSX. The SDK already guarantees determinism, redaction, and dynamic-callback
marking, so the theme-side script stays thin.

## Tasks

### 1. Upgrade the SDK dependency

Move Pilot to `@weaverse/hydrogen@^5.19.0` so `@weaverse/schema@0.13.0`
resolves and the `sensitive` flag typechecks.

### 2. Remove duplicate registrations

Delete the second `Blogs` and `BlogPost` entries in
`app/weaverse/components.ts`. Registry drops from 84 entries to 82.

### 3. Classify the sensitive setting

Mark `aliReviewsApiKey` as `sensitive: true` and remove its `defaultValue`,
which the schema now forbids on sensitive inputs.

### 4. Add the manifest generator

`other/generate-component-manifest.mjs`:

- boots Vite in middleware mode with `~/` aliased to `app/`
- SSR-loads `app/weaverse/components.ts`
- calls `generateComponentManifest()` with provenance
  `{name: '@weaverse/pilot', revision: <git sha>, version: <package version>}`
- writes `.weaverse/component-manifest.json`
- supports `--check` to verify the committed artifact matches, without writing

Provenance revision falls back to `GITHUB_SHA` in CI, then `git rev-parse HEAD`,
so the value is meaningful in both environments.

### 5. Add the settings audit

`other/audit-weaverse-settings.mjs` reads the generated manifest and fails on:

- duplicate component types
- a setting whose name matches a secret-shaped pattern but lacks
  `sensitive: true`
- any sensitive value surviving into defaults, presets, or examples

Suspicious-name matching needs an explicit allowlist so reviewed false
positives such as `popularSearchKeywords` do not permanently break CI.

### 6. Add CI

Pilot has no PR workflow at all. Add `.github/workflows/ci.yml` running
typecheck, Biome, manifest drift check, and the settings audit.

Scope carefully: this is Pilot's first automated gate, so it must cover the new
contract without turning unrelated pre-existing debt into a merge blocker.

### 7. Documentation

- `DESIGN.md`: brand tokens, accessibility rules, component usage, prohibited
  patterns, worked examples.
- `.agents/weaverse.md`: how to regenerate the manifest, what the audit
  enforces, and safe-composition guidance.
- Update `AGENTS.md` to point at both.

## Verification

- `node other/generate-component-manifest.mjs --check` passes on a clean tree.
- Running the generator twice produces identical bytes and hash.
- Editing any schema makes `--check` fail.
- Reintroducing a duplicate registration fails the audit.
- Removing `sensitive: true` from `aliReviewsApiKey` fails the audit.
- The committed manifest contains no secret-shaped values.
- `npm run typecheck` and `npm run biome` stay clean.

## Risks

**First CI on a mature repo.** Enabling typecheck and lint may surface existing
failures. Verify locally against unmodified `main` before wiring the workflow,
and keep scope to gates that already pass.

**Vite boot cost in CI.** Loading the registry needs a real Vite server. If it
proves slow or flaky, the fallback is a prebuilt SSR bundle, but only if
measurements justify it.

**Manifest churn.** The artifact changes whenever any schema changes, so it will
appear in unrelated diffs. Documentation must make regeneration a normal,
explicit step rather than a surprise.
