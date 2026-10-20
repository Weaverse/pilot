# Feature: Setup Guide Removes .github Folder

| Field            | Value                                                    |
| ---------------- | -------------------------------------------------------- |
| **Status**       | in-progress                                              |
| **Owner**        | @hta218                                                  |
| **Issue**        | [#181](https://github.com/Weaverse/pilot/issues/181)     |
| **Branch**       | `docs/setup-guide-remove-github-folder`                  |
| **Created**      | 2026-10-04                                               |
| **Last Updated** | 2026-10-04                                               |

## Initiating Requirement

> Weaverse plans to retire `Weaverse/pilot-demo` and connect Shopify Oxygen deployment directly to `Weaverse/pilot`. `.github/workflows/` will then contain Weaverse-internal workflows: `oxygen-deployment-<storefront-id>.yml` (deploys the live demo with Weaverse's deployment token, runs on every push), `ci.yml`, and `claude-code-review.yml` (needs `CLAUDE_CODE_OAUTH_TOKEN`).
>
> `@weaverse/cli` will strip `.github/` (`Weaverse/weaverse#532`), but developers can also start straight from this repo: README "Option C — Clone and run it yourself" uses `git clone`, which keeps all three workflows, so the developer's first push triggers deploys and reviews that fail without Weaverse's secrets.
>
> - README Option C: add a step to delete `.github/` after cloning and explain why.
> - Mention that connecting their own Oxygen storefront generates a fresh deployment workflow.
> - Check that `AGENTS.md` and the `setup-weaverse-project` skill (Option A) also remove `.github/` when they clone the repo directly.
> - Acceptance: every README setup path (A, B and C) ends with a project that has no Weaverse-internal workflows.
>
> Related: `Weaverse/docs#56`, parent `Weaverse/pilot#182`.

## Summary

The README's clone-based setup now removes `.github/` so developers starting directly from this repo do not inherit Weaverse's deployment, CI, and code-review workflows.
