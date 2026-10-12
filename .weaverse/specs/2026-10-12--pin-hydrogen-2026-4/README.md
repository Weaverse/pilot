# Maintenance: Pin Hydrogen to the 2026.4 line

| Field            | Value                                                       |
| ---------------- | ----------------------------------------------------------- |
| **Status**       | completed                                                   |
| **Owner**        | @hta218                                                     |
| **Issue**        | Related: [#191](https://github.com/Weaverse/pilot/issues/191) |
| **Branch**       | `fix/pin-hydrogen-2026-4`                                   |
| **Created**      | 2026-10-12                                                  |
| **Last Updated** | 2026-10-12                                                  |

## Initiating Requirement

Change Pilot's `@shopify/hydrogen` range from `^2026.4.7` to `~2026.4.7` in a
small, separate pull request.

Hydrogen uses calendar versions, so npm treats `2026` as the major version and
`^2026.4.7` admits `2026.10.0`. Hydrogen 2026.10 is a framework-agnostic rewrite
that removes APIs `@weaverse/hydrogen` imports (`CacheCustom`,
`createWithCache`), so a fresh install or `npm update` would break Pilot. Keep
Pilot on the maintained 2026.4 line until the migration in #191.

## Summary

Restrict `@shopify/hydrogen` to `2026.4.x` patch releases. The lockfile already
resolves `2026.4.7`, so installed packages do not change.
