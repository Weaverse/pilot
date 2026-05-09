# Contributing to Pilot

## Versioning Convention

Pilot uses **datetime-based versioning**: `YYYY.M.D`

### Format

- **Standard release**: `2026.3.16`
- **Multiple same-day releases**: `2026.3.16-2`, `2026.3.16-3`

### Why not semver?

Pilot is a **theme that gets forked** by clients, not a library that gets installed. Semver's major/minor/patch distinctions give false compatibility signals — any change can conflict with client customizations. Datetime versioning is honest: it tells you exactly when the upstream snapshot was taken and how far behind you are.

### Changelog entries

Every release must have entries in `CHANGELOG.md` using these tags:

- `[breaking]` — Changes that may require client action (renamed settings, removed sections, changed data shapes)
- `[feature]` — New functionality (new sections, settings, integrations)
- `[fix]` — Bug fixes and corrections

Example:

```markdown
## 2026.3.16

- [feature] Add country name display setting to header
- [fix] Prevent vertical scrolling in swimlane component
- [breaking] Rename `filtersPosition` setting values
```
