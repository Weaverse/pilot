# Plan

1. README Option C: add `rm -rf .github` right after `cd my-storefront`, plus a short `[!NOTE]` explaining which workflows it removes, why they fail, and that connecting Oxygen adds the developer's own deploy workflow.
   The note also covers repos created with GitHub's **Use this template** button, since `Weaverse/pilot` is a template repository and the button copies `.github/` too.
2. Options A and B need no README change:
   - Option B (Studio) runs `npx @weaverse/cli@latest create`, which strips `.github/` since `@weaverse/cli@5.6.5` (`Weaverse/weaverse#532`).
   - Option A's `setup-weaverse-project` skill (`Weaverse/shopify-hydrogen-skills`) prefers the CLI and only falls back to clone/degit when the CLI is unavailable. That fallback now strips `.git .github .weaverse` too (`Weaverse/shopify-hydrogen-skills#4`).
3. `AGENTS.md` has no clone-based setup instructions, so it needs no change.

## Files touched

- `README.md`
- `.weaverse/specs/2026-10-04--setup-guide-remove-github-folder/`
