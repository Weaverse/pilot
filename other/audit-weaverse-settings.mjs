#!/usr/bin/env node
/**
 * Audit Pilot's component manifest for registration and sensitivity problems.
 *
 * Usage:
 *   node other/audit-weaverse-settings.mjs
 *
 * This is a review aid, not the security boundary. `sensitive: true` in a
 * schema is what actually redacts a value; the name heuristic below only
 * catches settings a human forgot to classify.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { MANIFEST_PATH } from "./weaverse-manifest.mjs";

/**
 * Setting names that look like credentials.
 *
 * Matched against the setting name only. Tuned to credential-bearing words:
 * `auth` alone matched Pilot's `authorName`/`authorTitle` content fields, so
 * authentication terms are spelled out rather than matched by prefix.
 */
const SUSPICIOUS_NAME =
  /(api[_-]?key|secret|token|password|passwd|credential|private[_-]?key|access[_-]?key|auth[_-]?(token|key|secret|header)|authorization|signature|webhook)/i;

/**
 * Values that must never appear in a committed manifest, regardless of name.
 */
function looksLikeSecretValue(value) {
  if (typeof value !== "string" || value.length < 16) {
    return false;
  }
  return (
    // Vendor-prefixed keys. The body allows `_` and `-` so segmented forms such
    // as `sk_live_…` are caught, not just `sk_…`.
    /^(sk|pk|rk|ghp|gho|ghs|xox[abps])[-_][A-Za-z0-9_-]{10,}/.test(value) ||
    /^shp(at|ca|pa|ss)_[A-Za-z0-9]{16,}/.test(value) ||
    /^Bearer\s+\S{12,}/i.test(value) ||
    // JWT: header.payload, dot-separated.
    /^eyJ[A-Za-z0-9_-]{10,}\./.test(value)
  );
}

function* walkValues(value, trail = "") {
  if (Array.isArray(value)) {
    for (const [index, entry] of value.entries()) {
      yield* walkValues(entry, `${trail}[${index}]`);
    }
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, entry] of Object.entries(value)) {
      yield* walkValues(entry, trail ? `${trail}.${key}` : key);
    }
    return;
  }
  yield [trail, value];
}

function auditDuplicateTypes(manifest, failures) {
  const seen = new Set();
  for (const component of manifest.components) {
    if (seen.has(component.type)) {
      failures.push(
        `Duplicate component type "${component.type}". Each type may be registered only once in app/weaverse/components.ts.`,
      );
    }
    seen.add(component.type);
  }
}

function auditUnclassifiedSettings(manifest, failures) {
  for (const component of manifest.components) {
    for (const group of component.settings ?? []) {
      for (const input of group.inputs ?? []) {
        // Headings carry no value and therefore no sensitivity.
        if (!input.name) {
          continue;
        }
        if (!SUSPICIOUS_NAME.test(input.name)) {
          continue;
        }
        if (input.sensitive === true) {
          continue;
        }
        failures.push(
          `Setting "${input.name}" on component "${component.type}" looks like a credential but is not marked \`sensitive: true\`.\n` +
            "  Mark it sensitive, or rename it if it holds no credential.",
        );
      }
    }
  }
}

function auditLeakedValues(manifest, failures) {
  for (const component of manifest.components) {
    const surfaces = {
      presets: component.presets,
      examples: component.examples,
      // `defaultValue` lives here, so this is the largest surface a hardcoded
      // credential can reach. The name heuristic above misses a benign name
      // like `apiEndpoint`; this catches it by value shape instead.
      settings: component.settings,
    };
    for (const [surface, value] of Object.entries(surfaces)) {
      if (value === undefined) {
        continue;
      }
      for (const [trail, entry] of walkValues(value)) {
        if (looksLikeSecretValue(entry)) {
          failures.push(
            `Component "${component.type}" has a secret-shaped value in ${surface} at "${trail}". The manifest must never contain credentials.`,
          );
        }
      }
    }
    for (const group of component.settings ?? []) {
      for (const input of group.inputs ?? []) {
        if (input.sensitive === true && "defaultValue" in input) {
          failures.push(
            `Sensitive setting "${input.name}" on component "${component.type}" carries a defaultValue. Sensitive inputs must not declare one.`,
          );
        }
      }
    }
  }
}

async function main() {
  const relativePath = path.relative(process.cwd(), MANIFEST_PATH);
  let manifest;
  try {
    manifest = JSON.parse(await readFile(MANIFEST_PATH, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") {
      console.error(`Missing ${relativePath}.`);
      console.error("Run: npm run weaverse:manifest");
      process.exit(1);
    }
    throw error;
  }

  const failures = [];
  auditDuplicateTypes(manifest, failures);
  auditUnclassifiedSettings(manifest, failures);
  auditLeakedValues(manifest, failures);

  if (failures.length > 0) {
    console.error(`Weaverse settings audit failed (${failures.length}):\n`);
    for (const failure of failures) {
      console.error(`  - ${failure}`);
    }
    process.exit(1);
  }

  const settingCount = manifest.components.reduce(
    (total, component) =>
      total +
      (component.settings ?? []).reduce(
        (groupTotal, group) => groupTotal + (group.inputs ?? []).length,
        0,
      ),
    0,
  );
  console.log(
    `Weaverse settings audit passed: ${manifest.components.length} components, ${settingCount} settings.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
