# Plan — portable SDD requirements

## Contract

- Top-level `AGENTS.md` requires every agent to read and follow the canonical `.claude/rules/spec-driven-development.md` convention.
- New and touched specs use the `Initiating Requirement` heading and dated `Scope Updates`.
- Private source-file locations are removed after their substantive requirements are inlined.
- Substantive repository paths, runtime paths, and URLs are normalized to portable forms when possible and then preserved exactly with their meaning.
- Credential and secret redaction takes priority over every preservation rule.
- All remaining substantive constraints, identifiers, commands, literal values, acceptance conditions, and externally meaningful branch, base, and head identifiers are preserved exactly.
- Historical specs are not bulk-migrated.

## Implementation

1. Add the required canonical SDD link and portable-requirement summary to top-level `AGENTS.md`.
2. Align the canonical SDD rule with the path-normalization and secret-precedence contract.
3. Add this minimal canonical spec under Pilot's `.weaverse/specs/` authority.
4. Verify obsolete raw-prompt directives are absent and review the full docs-only branch diff.
5. Keep PR #476 open for review; do not merge, deploy, or release.

## Files expected

- `AGENTS.md`
- `.claude/rules/spec-driven-development.md`
- `.weaverse/specs/2026-09-01--sdd-portable-requirements/README.md`
- `.weaverse/specs/2026-09-01--sdd-portable-requirements/plan.md`

## Verification

- Search the touched policy files for obsolete exact raw-prompt requirements.
- Run any repository check that directly validates the spec index or Markdown files when available.
- Run `git diff --check`.
- Review the complete `origin/main...HEAD` diff for docs-only scope and policy consistency.
- Push the branch and read back the exact remote PR head, body, and checks.
