import { createContext, useContext } from "react";

// App-owned replacement for Hydrogen's `createContentSecurityPolicy`,
// `NonceProvider` and `useNonce`, which Hydrogen 2026.10 removes. Same
// header semantics as the Hydrogen 2026.4 helper.

type CspDirectiveValue = string[] | string | boolean;

export type CspDirectives = {
  [directive: string]: CspDirectiveValue;
};

type CspShop = { checkoutDomain?: string; storeDomain?: string };

const NonceContext = createContext<string | undefined>(undefined);

export const NonceProvider = NonceContext.Provider;

export function useNonce() {
  return useContext(NonceContext);
}

export function generateNonce() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}

/**
 * Builds the CSP header for a document response. Each directive the app
 * passes extends Hydrogen's defaults (a `'none'` default is replaced), and
 * the nonce is added to `scriptSrc` when the app sets it, else to `defaultSrc`.
 */
export function createContentSecurityPolicy(
  nonce: string,
  directives: CspDirectives = {},
  shop?: CspShop,
) {
  const nonceSource = `'nonce-${nonce}'`;
  const connectSrc = [
    "'self'",
    "https://cdn.shopify.com/",
    "https://monorail-edge.shopifysvc.com",
  ];
  if (shop?.checkoutDomain) {
    connectSrc.push(`https://${shop.checkoutDomain}`);
  }
  if (shop?.storeDomain) {
    connectSrc.push(`https://${shop.storeDomain}`);
  }
  const defaults: Record<string, string[]> = {
    baseUri: ["'self'"],
    defaultSrc: [
      "'self'",
      nonceSource,
      "https://cdn.shopify.com",
      "https://shopify.com",
    ],
    frameAncestors: ["'none'"],
    styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.shopify.com"],
    connectSrc,
  };

  const merged: CspDirectives = { ...defaults, ...directives };
  for (const [name, defaultValue] of Object.entries(defaults)) {
    const value = directives[name];
    if (!value) {
      continue;
    }
    const custom = Array.isArray(value) ? value : [String(value)];
    merged[name] = defaultValue.every((source) => source === "'none'")
      ? custom
      : [...custom, ...defaultValue];
  }

  if (Array.isArray(merged.scriptSrc)) {
    merged.scriptSrc = withNonce(merged.scriptSrc, nonceSource);
  } else if (Array.isArray(merged.defaultSrc)) {
    merged.defaultSrc = withNonce(merged.defaultSrc, nonceSource);
  }

  return Object.entries(merged)
    .filter(([, value]) => value !== false)
    .map(([name, value]) => {
      const directive = name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
      if (value === true) {
        return directive;
      }
      return `${directive} ${Array.isArray(value) ? value.join(" ") : value}`;
    })
    .join("; ");
}

function withNonce(sources: string[], nonceSource: string) {
  return [
    ...sources.filter((source) => !source.startsWith("'nonce")),
    nonceSource,
  ];
}
