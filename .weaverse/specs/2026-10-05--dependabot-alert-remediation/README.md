# Maintenance: Dependabot Alert Remediation

| Field            | Value                                                        |
| ---------------- | ------------------------------------------------------------ |
| **Status**       | in-progress                                                  |
| **Owner**        | @hta218                                                      |
| **Issue**        | —                                                            |
| **PR**           | [#185](https://github.com/Weaverse/pilot/pull/185)           |
| **Branch**       | `fix/security-overrides`                                     |
| **Created**      | 2026-10-05                                                   |
| **Last Updated** | 2026-10-05                                                   |

## Initiating Requirement

> Review the open GitHub security alerts on `Weaverse/pilot` and resolve what
> can be resolved safely:
>
> 1. Add npm `overrides` for the transitive packages that have an in-range fix
>    (`brace-expansion` `^5.0.12`, `js-yaml` `^4.3.2`). Do this on a separate
>    branch and open a PR into `dev`.
> 2. Dismiss alerts that do not apply to Pilot, with a reason.
> 3. Leave alerts open that are blocked upstream.
> 4. Enable secret scanning on the repository.

## Summary

Pilot's default branch carried 11 open Dependabot alerts. This change pins two
transitive packages to patched releases through `overrides`, which clears four
alerts without touching application code. The remaining alerts are either not
applicable (dismissed on GitHub) or blocked by Hydrogen's `react-router` peer
range and by `braces` having no patched release.
