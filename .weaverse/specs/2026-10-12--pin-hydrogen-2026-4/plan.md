# Plan

1. Change `@shopify/hydrogen` from `^2026.4.7` to `~2026.4.7` in `package.json`
   and the root entry of `package-lock.json`.
2. Confirm `npm install` leaves the lockfile unchanged and still resolves
   `2026.4.7`.

Upgrading to Hydrogen 2026.10 is out of scope; it is tracked in
[#191](https://github.com/Weaverse/pilot/issues/191).

## Files and Folders Touched

- `package.json`
- `package-lock.json`
- `.weaverse/specs/2026-10-12--pin-hydrogen-2026-4/`
