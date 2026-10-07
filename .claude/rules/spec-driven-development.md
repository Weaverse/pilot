# Spec-Driven Development (SDD) Conventions

> **If you are an AI coding agent, you MUST follow these conventions.** They are project-specific.

## Issue-first, single-spec

Each fact has one owner. Never mirror the same metadata or acceptance checklist in more than one place.

| Owner | Holds |
| --- | --- |
| **GitHub issue** | Owner, priority, milestone, status, discussion, links |
| **Spec** (`README.md` in the spec folder) | Requirements, acceptance, technical approach, verification strategy, current important decisions |
| **Pull request** | Implementation and observed verification evidence (CI, smoke runs) |
| **Git** | History |

- Substantive issue-governed work links to its real GitHub issue before implementation starts.
- Follow the repository's branch and release policy. Resolve both the PR's actual base branch and the remote's default branch; never assume either.
- When a PR fully resolves a task-scoped issue and targets the default branch, use a closing keyword (`Closes #NNNN`) and read back the actual Development relationship (`gh pr view <N> --json closingIssuesReferences`). A plain mention is not a link.
- When a PR legitimately targets a non-default branch (staging, release, stacked), establish the explicit Development link GitHub supports for that case, then read it back. Never retarget a PR solely to make linking work.
- Partial work does not close a broader parent issue.

## When a spec file is needed

- **Small, clear bug or maintenance:** the existing issue is the mini-spec. No new file.
- **Reviewing, verifying, or merging someone else's implementation:** use its PR/issue. No new administrative tracker.
- **Substantive feature or contract change:** use a file spec. Search first and update the closest canonical spec; do not create a file per issue or PR.
- Before a spec file exists, the issue holds intake. Once promoted to a file, replace the duplicated issue detail with a pointer to the spec so there are never two authoritative copies.
- **Cross-repository outcome** (e.g. a Builder or SDK change Pilot consumes): keep one shared contract in the repository that owns the outcome and link to it from here. Add a local spec only for genuinely independent theme detail.

## Location and paths

Pilot specs live in `.weaverse/specs/` (not `.specs/`):

```
.weaverse/specs/YYYY-MM-DD--kebab-case-title/README.md
```

- The date is the **creation** date. It is immutable context, not status.
- **Do not rename or move a spec folder when it is updated.** Paths are stable so links keep working.
- Do not flatten, re-date, or move existing trees.

## The spec file

One `README.md` per spec folder. Write in English; keep it portable and self-contained. Minimum sections:

```markdown
# [Title]

Issue: [#NNNN](https://github.com/Weaverse/pilot/issues/NNNN)

## Outcome
[What changes for whom, and why.]

## Scope & contract
[Requirements, constraints, section/schema surface, identifiers. Include non-goals.]

## Acceptance
[Observable conditions that make this done.]

## Approach
[Steps, affected files, and current important technical decisions.]

## Verification
[How the behavior will be proven: tests, builds, smoke runs.]
```

- Add **Risks**, **Migration**, or **Rollback** sections only when meaningful (e.g. `[breaking]` changes for forked themes).
- Do **not** add Status, Owner, Priority, or progress fields — those live on the issue.
- **Requirements are revised, not pasted.** State them concisely and professionally; exclude raw chat and agent-orchestration chatter. Preserve every substantive constraint, acceptance condition, and identifier. Read any local brief or attachment and inline its essential requirements; a private machine path used only to locate it is provenance, not requirement text. Normalize substantive repository paths, URL routes, API paths, and runtime paths to portable forms, then preserve them.
- **Always redact** credentials, secrets, tokens, private session material, and signed URLs (remove or replace with `[REDACTED]`) before any literal-value preservation.

## No parallel files

Do not create `plan.md`, `work-logs.md`, `design.md`, `tasks.md`, or `handoff.md` by default. Merge the useful plan into the spec's **Approach**; put progress and discussion on the issue and evidence on the PR.

## Legacy specs

Untouched historical folders (with `plan.md`, `work-logs.md`, or Status/Owner tables) stay as they are; do not bulk-migrate. When you substantively edit an existing README/plan pair, consolidate its current unique requirements and approach into `README.md`, update backlinks, and retire the parallel plan as an active document only after its meaningful history/evidence is preserved. Historical evidence may remain, but never as a second maintained contract. Do not move the folder.
