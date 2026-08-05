# Weaverse Instructions for Agents

Repository-specific rules for agents modifying Weaverse components, schemas, or
compositions in Pilot. Read this before changing anything under `app/sections/`,
`app/weaverse/`, or `.weaverse/`.

For general Weaverse patterns see `AGENTS.md`. For visual and accessibility
constraints see `DESIGN.md`.

## The component manifest

`.weaverse/component-manifest.json` is a committed, versioned description of
every component Pilot registers: types, settings, non-sensitive defaults, child
rules, limits, presets, loader presence, and availability metadata.

It exists so tools and agents can reason about the theme's capabilities without
executing it. It is generated, never hand-edited.

### Regenerating

```bash
npm run weaverse:manifest
```

Run this whenever you change a component schema, add or remove a section, or
edit the registry. Commit the result with the change that caused it.

CI runs the equivalent check:

```bash
npm run weaverse:manifest:check
```

This fails when the committed artifact does not match the current schemas. A
failure means someone changed a schema and forgot to regenerate — regenerate and
commit, do not edit the JSON by hand.

### What the generator will not do

- It never reads merchant pages or content.
- It never executes loaders. It records only whether a loader exists.
- It never evaluates availability callbacks. A function-based rule is recorded
  as `{"dynamic": true}`, meaning "only the deployed runtime can answer this".
- It never serializes function source.

### Determinism

The same schemas always produce the same bytes and the same `sha256:` hash.
That hash binds a proposal to an exact theme build, so determinism is a hard
requirement, not a nicety.

**Never put a computed-at-load-time value in a schema default.** A default like
`Date.now() + ONE_DAY` changes on every module load, making the manifest differ
from itself and the drift check permanently red. If a component needs a
relative default, compute it at runtime in the component and leave the schema
default absent — see `app/sections/countdown/timer.tsx`.

## Sensitivity

Any *component* setting holding a credential, token, or server-only value must
be marked. Theme settings in `app/weaverse/settings/` do not enter the manifest
and are not covered by the audit, so never put a credential there.

```ts
{
  type: "text",
  name: "aliReviewsApiKey",
  label: "Ali Reviews API key",
  sensitive: true,
}
```

`sensitive: true` causes the SDK to redact the value from manifest defaults,
presets, registered child presets, and examples — recursively, including inside
arrays. The setting's *name* and *shape* stay visible so agents know it exists;
only values are withheld.

Sensitive inputs must not declare a `defaultValue`. This is enforced by
TypeScript, by Zod at runtime, and by the generated JSON Schema.

### The audit

```bash
npm run weaverse:audit
```

Fails on:

- duplicate component types
- a setting whose name looks like a credential but lacks `sensitive: true`
- a sensitive setting that declares a `defaultValue`
- any secret-shaped value that reached settings, presets, or examples

**The heuristic is not the security boundary.** Name matching only catches what
a human forgot to classify. `sensitive: true` is what actually protects a value.
Never assume a setting is safe because the audit passed.

If the audit flags a setting that genuinely holds no credential, rename it. The
pattern is deliberately narrow, so a match usually means the name is misleading.

## Registering components

Every component is registered exactly once in `app/weaverse/components.ts`.

Duplicate registrations are a real defect — this repository shipped with `Blogs`
and `BlogPost` listed twice. The manifest generator now refuses to build when it
sees a duplicate type, so CI catches it.

When adding a section:

1. Export `schema` via `createSchema()` from the section file.
2. Add exactly one registry entry.
3. Run `npm run weaverse:manifest`.
4. Commit source and manifest together.

## Safe composition

- Components declare where they may be placed. Respect `childTypes` and `limit`
  rather than assuming nesting is legal.
- `{"dynamic": true}` means the rule cannot be resolved statically. Do not guess
  at its outcome; the deployed runtime decides.
- Availability metadata describes the theme's rules, not a merchant's current
  page. The manifest never tells you what a merchant has actually built.
- Changing a schema changes the manifest hash, which invalidates proposals
  authored against the previous build. Treat schema edits as contract changes.

## Checklist

Before finishing any Weaverse change:

- [ ] `npm run typecheck`
- [ ] `npm run biome`
- [ ] `npm run weaverse:manifest` (and commit the result)
- [ ] `npm run weaverse:audit`
- [ ] New credential-bearing settings marked `sensitive: true`
- [ ] No computed-at-load-time schema defaults
- [ ] Each component registered exactly once
