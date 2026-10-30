/**
 * The worker entry and its request context, bundled together.
 *
 * Importing app server code straight into a test leaves Node's ESM loader to
 * resolve the UI chain behind the Weaverse component registry, which uses
 * extensionless deep imports only a bundler accepts. One bundle also gives the
 * fetch handler and the context the same module instances, as in a build.
 */
export { createAppContext } from "~/.server/context";
export { default as server } from "../../server";
