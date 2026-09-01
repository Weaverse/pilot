# Feature: Portable SDD requirements

| Field            | Value |
| ---------------- | ----- |
| **Status**       | in-progress |
| **Owner**        | @paul-phan |
| **Issue**        | N/A |
| **Pull Request** | [#476](https://github.com/Weaverse/pilot/pull/476) |
| **Branch**       | `docs/sdd-portable-requirements` |
| **Base**         | `main` at `3a91966553131c7ad71c7dfc56614801ba55eb7a` |
| **Created**      | 2026-09-01 |
| **Last Updated** | 2026-09-01 |

## Initiating Requirement

> Publish a docs-only repository-owned SDD policy through branch `docs/sdd-portable-requirements` and PR [#476](https://github.com/Weaverse/pilot/pull/476), based on `main` at `3a91966553131c7ad71c7dfc56614801ba55eb7a`, without merging, deploying, or releasing. Make the canonical `.claude/rules/spec-driven-development.md` convention visible to non-Claude agents through an explicit required link and summary in top-level `AGENTS.md`. Require new and touched specs to store a concise, self-contained, professionally revised initiating requirement rather than raw chat. Inline substantive requirements from briefs and attachments; remove private source locations, conversational scaffolding, orchestration chatter, credentials, secrets, and irrelevant prose. Preserve substantive constraints, identifiers, commands, literal values, acceptance conditions, and externally meaningful branch, base, and head identifiers. Record later user intent as dated, similarly revised scope updates. Keep historical specs unchanged.

## Scope Updates

### 2026-09-01

- Distinguish private source-file locations used only to find source material from substantive repository paths, runtime paths, and URLs.
- Normalize substantive paths to portable forms when possible and preserve the normalized paths and their meaning exactly.
- Make credential and secret redaction explicitly higher priority than literal-value or identifier preservation.
- Align the companion rule with Pilot's existing touched-spec convention: refresh the folder date, preserve `Created`, match `Last Updated`, and update backlinks and generated indexes.
- Keep this README and `plan.md` as the minimal canonical spec required by Pilot's SDD convention.

## Summary

Top-level agent guidance now requires every agent to follow Pilot's canonical SDD rule and summarizes its portable requirement contract. The change is limited to policy documentation and this required spec; it does not migrate historical specs or modify product code.
