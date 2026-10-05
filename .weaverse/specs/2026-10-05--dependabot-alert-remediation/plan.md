# Plan

## Alert Triage (2026-10-05)

| Alerts | Package | Installed | Action |
| ------ | ------- | --------- | ------ |
| #168, #169, #170 | `brace-expansion` (via `minimatch`) | 5.0.9 | Override to `^5.0.12`, inside `minimatch`'s `^5.0.8` range |
| #167 | `js-yaml` (via `cosmiconfig`) | 4.3.1 | Override to `^4.3.2`, inside `cosmiconfig`'s `^4.1.0` range |
| #163, #166 | `react-router` | 7.16.0 | Dismiss: both affect RSC mode only, which Hydrogen does not use |
| #162, #164, #165 | `react-router` | 7.16.0 | Keep open: fix is `7.18.x`, but `@shopify/hydrogen@2026.4.7` (latest) declares peer `react-router: ~7.16.0` |
| #171 | `braces` (via `micromatch`) | 3.0.3 | Keep open: no patched release exists |
| #160 | `cookie` (via `youch`, dev only) | 0.5.0 | Dismiss: development tooling, not shipped to the storefront |

`.npmrc` sets `legacy-peer-deps=true`, so npm would accept a `react-router`
override; the Hydrogen peer range is respected deliberately.

## Steps

- [x] Add `brace-expansion` and `js-yaml` to `overrides` in `package.json`
- [x] Regenerate `package-lock.json` (`npm install --package-lock-only`)
- [x] CI `Verify` passes on the PR into `dev`
- [ ] Dismiss #160, #163, #166 on GitHub with reasons
- [ ] Enable secret scanning
- [x] Close Dependabot PR #180, superseded by the override

## Files and Folders Touched

- `package.json` — `overrides`
- `package-lock.json`
- `.weaverse/specs/2026-10-05--dependabot-alert-remediation/` — this spec
