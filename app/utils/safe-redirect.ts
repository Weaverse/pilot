/**
 * A redirect target that is unambiguously a path on this storefront.
 *
 * `redirectTo` arrives as a hidden field on public, unauthenticated cart forms,
 * so it is attacker-controlled. The rule is positive and narrow: exactly one
 * leading `/`, and the next character must not turn the value into a
 * network-path reference.
 *
 * Rejected, with the reason each one matters:
 * - `//evil.example/phish` — a network-path reference. `new URL()` throws on it
 *   without a base, so a "does it parse as absolute?" check called it local,
 *   while every browser reads it as `https://evil.example/phish`.
 * - `/\evil.example` and `\\evil.example` — browsers normalise backslashes to
 *   forward slashes in the authority, so these are the same attack.
 * - `https://…`, `javascript:`, `data:` — absolute or scheme-bearing.
 * - anything not starting with `/` — relative, and resolved against whatever
 *   path the action happened to run on.
 *
 * Query and fragment are preserved: switching markets must keep an active
 * filter, sort, or anchor.
 */
export function safeRedirectPath(target: unknown, fallback: string): string {
  if (typeof target !== "string" || !target.startsWith("/")) {
    return fallback;
  }

  // The authority of a network-path reference begins at the second character,
  // and `\` is normalised to `/` there, so neither may follow the leading `/`.
  const second = target[1];
  if (second === "/" || second === "\\") {
    return fallback;
  }

  // A control character can truncate or split the header downstream.
  // biome-ignore lint/suspicious/noControlCharactersInRegex: rejecting them is the point
  if (/[\u0000-\u001f\u007f]/.test(target)) {
    return fallback;
  }

  return target;
}
