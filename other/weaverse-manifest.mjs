/**
 * Shared helpers for building Pilot's component manifest.
 *
 * The registry is loaded through Vite's SSR module runner so the generator
 * observes exactly what the storefront registers — including `~/` aliases,
 * TypeScript, and JSX — rather than a re-parsed approximation of it.
 */

import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = fileURLToPath(new URL("..", import.meta.url));
const REGISTRY_MODULE = "/app/weaverse/components.ts";

export const MANIFEST_PATH = path.join(
  REPO_ROOT,
  ".weaverse",
  "component-manifest.json",
);

/**
 * Revision recorded in the committed artifact.
 *
 * Deliberately *not* the git HEAD SHA. The manifest lives in the repository, so
 * committing it would change HEAD and immediately invalidate the revision it
 * just recorded — every commit would report drift against itself.
 *
 * The theme version is stable across commits and changes only on release, which
 * is the granularity at which a published runtime actually changes. Deployment
 * pipelines that need exact-SHA binding pass `--revision` explicitly rather than
 * baking a volatile value into version control.
 *
 * @param {string} version Theme version from `package.json`.
 */
export function defaultRevision(version) {
  return `v${version}`;
}

/**
 * Load Pilot's registered Weaverse components.
 *
 * @returns {Promise<Array<{schema: unknown, loader: unknown}>>}
 */
export async function loadRegisteredComponents() {
  const { createServer } = await import("vite");
  const server = await createServer({
    configFile: false,
    root: REPO_ROOT,
    server: { middlewareMode: true, hmr: false },
    optimizeDeps: { noDiscovery: true },
    resolve: {
      alias: [{ find: /^~\//, replacement: path.join(REPO_ROOT, "app/") }],
    },
    ssr: {
      // `@weaverse/hydrogen` ships a CommonJS `main` that requires
      // `@weaverse/schema`, which is ESM-only. Letting Node externalize it
      // would hit that broken CJS path. Routing the packages through Vite
      // resolves their ESM entrypoints, matching how the storefront builds.
      noExternal: [/^@weaverse\//],
    },
    logLevel: "error",
  });

  try {
    const module = await server.ssrLoadModule(REGISTRY_MODULE);
    const components = module.components;
    if (!Array.isArray(components)) {
      throw new Error(
        `Expected ${REGISTRY_MODULE} to export a \`components\` array.`,
      );
    }
    return components.map((component) => ({
      schema: component?.schema,
      // Recorded as presence only. The loader is never invoked.
      loader: component?.loader,
    }));
  } finally {
    await server.close();
  }
}

/**
 * Build the manifest artifact for the current working tree.
 *
 * @param {{revision?: string}} [options] Optional deployment revision override.
 */
export async function buildManifest(options = {}) {
  const [{ generateComponentManifest }, { default: pkg }, components] =
    await Promise.all([
      import("@weaverse/schema/manifest"),
      import("../package.json", { with: { type: "json" } }),
      loadRegisteredComponents(),
    ]);

  return generateComponentManifest(components, {
    source: {
      name: pkg.name,
      revision: options.revision || defaultRevision(pkg.version),
      version: pkg.version,
    },
  });
}
