# Verification

## 2026-09-30

- Upgraded the registry-resolved dependency chain to Hydrogen/React/Core `5.22.0` and schema `0.17.0`; the lockfile changes are limited to those four packages.
- Reviewed the source diff: only the five explicit `label` callbacks were added. Component titles, settings, conditions, loaders, render output, and translation behavior remain unchanged.
- `npm ci`, `npm run typecheck`, and repository-wide `npm run biome -- --diagnostic-level=error` passed.
- `npm test`: 198 tests passed, including callbacks loaded from the real component modules with supplied source/translated text and immutable input.
- `npm run build` passed; generated GraphQL declarations were unchanged.
- `npm run weaverse:manifest:check` and `npm run weaverse:audit` passed: 82 components and 489 settings.
- Regenerating the manifest also corrected pre-existing drift for the hotspots image media-picker settings already present on `dev`. Label callbacks are not serialized into the manifest.
- Authenticated Studio QA was not run. Use the checklist in `plan.md` once the Studio bridge implementation is available. No merge, release, or deployment was performed.
