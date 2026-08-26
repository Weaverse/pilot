# Work Logs

## 2026-05-18 — @paul-phan

- Implemented the workaround (PR #387), merged to `main` (`b9c48c9c`).
- Verified on a production Hydrogen 2026.4 storefront with a checkout-subdomain setup:
  - Before: `_tracking_consent` absent after clicking Accept; GA4 `collect` URL `gcs=G100` after refresh.
  - After: `_tracking_consent` written with `Domain=.mystore.com`, 365-day expiry, format byte-compatible with the SDK writer; banner does not reappear; GA4 stays `gcs=G111`; checkout honors consent.

## 2026-05-18 — Review findings (@hta218 review of PR #387)

Three unresolved risks were identified during code review. They did **not** block merge but should be addressed before relying on this for international / GDPR-strict deployments:

1. **Public-suffix domain bug (correctness, high for international stores).**
   `findCommonAncestorDomain()` uses a `parts.length >= 3` heuristic. For ccTLD/SLD apex hosts it returns a public suffix:
   - `mystore.co.uk` (3 parts) → `.co.uk` → browser rejects the cookie → consent never persists, banner reappears every refresh (the exact bug this PR fixes, just for a different class of domains). Same for `.com.au`, `.com.br`, etc.
   - **Recommended fix:** derive the root domain server-side from `env.PUBLIC_CHECKOUT_DOMAIN` (which the loader already has) and pass it to the component as a prop, instead of re-deriving on the client with a heuristic that doesn't match Hydrogen's real `commonAncestorDomain` logic.

2. **Localization regression.**
   The old config comment was "localize the privacy banner" and `country`/`language` fed the hosted banner. The custom banner text is hardcoded English; `country`/`language` now only feed the core SDK. Non-English storefronts get an English-only banner. Pull copy from theme/i18n.

3. **No consent withdrawal / management path (GDPR consideration).**
   After the first decision the cookie lives 365 days and the banner never re-shows. Only binary accept/decline-all (no granular per-purpose consent, no "Manage cookies" re-entry). Shopify's native banner offers re-management. Confirm this meets the compliance bar for target markets, or add a management entry point.

Lower-priority nits from the same review: dead `busy` state (set/cleared synchronously, disabled state never renders), unreachable `withBraces=false` serializer branch, `Secure`+`Domain=.localhost` means the cookie won't persist in local http dev (banner reappears each refresh in dev — acknowledged in code comment), non-UUID `consent_id` fallback in non-secure contexts.

**Brittleness note:** the `_tracking_consent` format is reverse-engineered from the SDK source. A future Shopify SDK/format bump could silently desync checkout consent with no runtime signal. Consider a lightweight assertion/test pinning the expected serialized shape so drift fails loudly. The documented 3-step revert path (see `plan.md`) is the primary mitigation.
