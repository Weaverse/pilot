/**
 * `Env` narrowed to the variables that are safe to expose to the browser.
 * Only keys prefixed with `PUBLIC_` are kept, mirroring Shopify/Oxygen's
 * convention for client-safe configuration.
 */
export type PublicEnv = {
  [K in keyof Env as K extends `PUBLIC_${string}` ? K : never]: Env[K];
};

/**
 * Filters the server `Env` down to its `PUBLIC_*` entries so the root loader can
 * forward configuration to the client without leaking private credentials.
 */
export function getPublicEnv(env: Env): PublicEnv {
  const publicEntries = Object.entries(env).filter(([key]) =>
    key.startsWith("PUBLIC_"),
  );
  return Object.fromEntries(publicEntries) as PublicEnv;
}
