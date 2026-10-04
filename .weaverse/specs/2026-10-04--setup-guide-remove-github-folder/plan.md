# Plan

1. README Option C: add `rm -rf .github` right after `cd my-storefront`, plus an `[!IMPORTANT]` note explaining which workflows it removes, why they fail, and that connecting Oxygen generates a fresh `oxygen-deployment-*.yml`.
2. Options A and B need no README change:
   - Option B (Studio) runs `npx @weaverse/cli@latest create`, which strips `.github/` once `Weaverse/weaverse#532` ships.
   - Option A's `setup-weaverse-project` skill (`Weaverse/shopify-hydrogen-skills`) prefers the CLI and only falls back to clone/degit when the CLI is unavailable. That fallback lives outside this repo and is flagged on the PR.
3. `AGENTS.md` has no clone-based setup instructions, so it needs no change.

## Files touched

- `README.md`
- `.weaverse/specs/2026-10-04--setup-guide-remove-github-folder/`
