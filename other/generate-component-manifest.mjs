#!/usr/bin/env node
/**
 * Generate `.weaverse/component-manifest.json` from Pilot's registered
 * Weaverse components.
 *
 * Usage:
 *   node other/generate-component-manifest.mjs              # write the artifact
 *   node other/generate-component-manifest.mjs --check      # verify, never write
 *   node other/generate-component-manifest.mjs --revision X # stamp a revision
 *
 * The manifest describes the *theme's* capabilities. It never contains merchant
 * content, and values marked `sensitive` in a schema are redacted by the SDK
 * before serialization.
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { buildManifest, MANIFEST_PATH } from "./weaverse-manifest.mjs";

function parseArgs(argv) {
  const args = { check: false, revision: undefined };
  const remaining = [...argv];
  while (remaining.length > 0) {
    const arg = remaining.shift();
    if (arg === "--check") {
      args.check = true;
    } else if (arg === "--revision") {
      args.revision = remaining.shift();
      if (!args.revision) {
        throw new Error("--revision requires a value");
      }
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return args;
}

async function readCommittedManifest() {
  try {
    return await readFile(MANIFEST_PATH, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const { manifest, json, hash } = await buildManifest({
    revision: args.revision,
  });
  const relativePath = path.relative(process.cwd(), MANIFEST_PATH);

  if (args.check) {
    const committed = await readCommittedManifest();
    if (committed === null) {
      console.error(`Missing ${relativePath}.`);
      console.error("Run: npm run weaverse:manifest");
      process.exitCode = 1;
      return;
    }
    if (committed !== json) {
      console.error(`${relativePath} is out of date.`);
      console.error(
        "A component schema, the registry, or the theme version changed",
      );
      console.error("without regenerating it.");
      console.error("Run: npm run weaverse:manifest");
      process.exitCode = 1;
      return;
    }
    console.log(
      `${relativePath} is up to date (${manifest.components.length} components, ${hash}).`,
    );
    return;
  }

  await writeFile(MANIFEST_PATH, json);
  console.log(
    `Wrote ${relativePath} (${manifest.components.length} components, ${hash}).`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
