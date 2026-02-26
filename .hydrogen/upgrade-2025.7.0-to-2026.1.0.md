# Hydrogen upgrade guide: 2025.7.0 to 2026.1.0

This upgrade spans **4 versions**: 2025.7.1 → 2025.10.0 → 2025.10.1 → 2026.1.0

----

## Summary of changes

| Version | Type | Key Changes |
|---------|------|-------------|
| **2025.7.1** | Patch | New Shopify cookie system, React Router 7.12.0, analytics improvements |
| **2025.10.0** | **Major** | Storefront API 2025-10, new cart mutations (`addGiftCardCodes`, `replaceDeliveryAddresses`), `@shopify/hydrogen-react@2026.0.0` |
| **2025.10.1** | Patch | Bug fix for file paths with spaces in virtual routes |
| **2026.1.0** | **Major** | Storefront API 2026-01, Customer Account API 2026-01, `cartDiscountCodesUpdate` now requires `discountCodes` argument |

----

## Package version changes

### Dependencies (package.json)

| Package | Current | Target | Notes |
|---------|---------|--------|-------|
| `@shopify/hydrogen` | `^2025.7.0` | `^2026.1.0` | Main upgrade target |
| `@react-router/dev` | `7.9.2` | `7.12.0` | Required peer dependency |
| `react-router` | `7.9.2` | `7.12.0` | Required peer dependency |

### DevDependencies (package.json)

| Package | Current | Target | Notes |
|---------|---------|--------|-------|
| `@shopify/cli` | `^3.87.4` | `^3.91.0` | Latest CLI |
| `@shopify/hydrogen-codegen` | `0.3.3` | `0.3.3` | No change needed |
| `@shopify/mini-oxygen` | `^4.0.0` | `^4.0.0` | No change needed |
| `@shopify/oxygen-workers-types` | `4.2.0` | `4.2.0` | No change needed |

----

## Step 1: Update package.json dependencies

> Update all Shopify and React Router packages to their target versions.

### Files to modify
- `package.json`

```diff
// package.json - dependencies
- "@react-router/dev": "7.9.2",
+ "@react-router/dev": "7.12.0",
- "@shopify/hydrogen": "^2025.7.0",
+ "@shopify/hydrogen": "^2026.1.0",
- "react-router": "7.9.2",
+ "react-router": "7.12.0",

// package.json - devDependencies
- "@shopify/cli": "^3.87.4",
+ "@shopify/cli": "^3.91.0",
```

### After updating
```bash
rm -rf node_modules package-lock.json
npm install
```

----

## Step 2: Run GraphQL codegen

> The Storefront API version has been bumped to 2026-01 and Customer Account API to 2026-01. Types need regeneration.

### Files affected
- `storefront-api.generated.d.ts` (auto-generated)
- `customer-account-api.generated.d.ts` (auto-generated)

```bash
npm run codegen
```

### Verification
- Check that codegen completes without errors
- Generated files will reflect new API types for 2026-01

----

## Step 3: Verify `cartDiscountCodesUpdate` usage (2026.1.0 breaking change)

> The `cartDiscountCodesUpdate` mutation now **requires** the `discountCodes` argument in Storefront API 2026-01. Search for any custom cart discount code logic.

### Files to check
Search the codebase for any usage of `cartDiscountCodesUpdate` or `cart.updateDiscountCodes`:

```bash
grep -r "cartDiscountCodesUpdate\|updateDiscountCodes\|DiscountCodesUpdate" app/ --include="*.{ts,tsx}"
```

### Action required
- If found: Ensure the `discountCodes` argument is always passed to the mutation
- If using the default `CartForm.ACTIONS.DiscountCodesUpdate` from Hydrogen: No changes needed (Hydrogen handles this internally)

----

## Step 4: Verify `cart.updateDeliveryAddresses([])` behavior change (2025.10.0)

> In Storefront API 2025-10+, passing an empty array to `cartDeliveryAddressesUpdate` now **clears all delivery addresses** instead of being a no-op.

### Files to check
```bash
grep -r "updateDeliveryAddresses\|cartDeliveryAddressesUpdate" app/ --include="*.{ts,tsx}"
```

### Action required
- If you call `cart.updateDeliveryAddresses([])` anywhere, verify the new behavior (clearing all addresses) is acceptable
- If not used: No changes needed

----

## Step 5: Review new features (optional adoption)

These are new features available after the upgrade. They are **not required** for the upgrade to work, but may be beneficial to adopt.

### 5a. New Shopify cookie system (2025.7.1)

The new cookie system (`_shopify_analytics` and `_shopify_marketing` http-only cookies) is **backward compatible**. The `createRequestHandler` and `Analytics.Provider` automatically handle this. No code changes needed.

**Note**: `createRequestHandler` now includes a Storefront API proxy for http-only cookies. This is transparent but can be disabled with `proxyStandardRoutes: false` if needed.

### 5b. React Router 7.12 stabilized future flags (2025.7.1)

React Router 7.12 stabilizes `v8_splitRouteModules` and `v8_middleware` flags (previously unstable). No action needed unless you were explicitly using the unstable versions.

### 5c. New cart mutations (2025.10.0)

New cart methods available:
- `cart.addGiftCardCodes(codes)` — Appends gift card codes without replacing existing ones
- `cart.replaceDeliveryAddresses(addresses)` — Replaces all delivery addresses in one operation
- `CartForm.ACTIONS.GiftCardCodesAdd` — New form action
- `CartForm.ACTIONS.DeliveryAddressesReplace` — New form action

These can be adopted in cart routes if desired but are not required.

### 5d. `visitorConsent` in `@inContext` directive (2025.10.0)

Not needed if using Hydrogen's Analytics.Provider or Shopify's Customer Privacy API (which Pilot does).

----

## Step 6: Build and verify

> Run the full build pipeline to ensure everything works.

```bash
# Type check
npm run typecheck

# Build
npm run build

# Dev server smoke test
npm run dev
```

### Expected outcome
- `npm run typecheck` passes without errors
- `npm run build` completes successfully
- Dev server starts and pages load correctly

----

## Step 7: Test critical flows

After the upgrade, manually verify these critical paths:

- [ ] Homepage loads correctly
- [ ] Product pages render with full data
- [ ] Collection pages work with filtering
- [ ] Cart operations: add, update quantity, remove, apply discount codes
- [ ] Cart gift card operations (if applicable)
- [ ] Customer account login/logout
- [ ] Customer account orders page
- [ ] Checkout flow
- [ ] Analytics events fire correctly (check browser dev tools Network tab)

----

## Risk assessment

| Risk | Level | Mitigation |
|------|-------|------------|
| Storefront API 2026-01 breaking changes | **Medium** | Codegen will catch type mismatches. Test all GraphQL queries. |
| Cart `discountCodes` required argument | **Low** | Hydrogen's built-in cart handler manages this internally |
| `updateDeliveryAddresses([])` behavior change | **Low** | Only affects if explicitly passing empty array |
| React Router 7.12 upgrade | **Low** | Backward compatible, stabilized flags |
| New cookie system | **Low** | Backward compatible, transparent proxy |

----

## Rollback plan

If the upgrade causes issues:
1. Revert the branch: `git checkout dev`
2. Re-run `npm install` to restore previous `node_modules`
3. The `.env` and data layer are not affected by this upgrade

----

## References

- [Hydrogen 2025.7.1 Release](https://github.com/Shopify/hydrogen/releases/tag/%40shopify%2Fhydrogen%402025.7.1)
- [Hydrogen 2025.10.0 Release](https://github.com/Shopify/hydrogen/releases/tag/%40shopify%2Fhydrogen%402025.10.0)
- [Hydrogen 2025.10.1 Release](https://github.com/Shopify/hydrogen/releases/tag/%40shopify%2Fhydrogen%402025.10.1)
- [Hydrogen 2026.1.0 Release](https://github.com/Shopify/hydrogen/releases/tag/%40shopify%2Fhydrogen%402026.1.0)
- [Storefront API 2026-01 Changelog](https://shopify.dev/changelog?filter=api&api_version=2026-01&api_type=storefront-graphql)
- [Customer Account API 2026-01 Changelog](https://shopify.dev/changelog?filter=api&api_version=2026-01&api_type=customer-account-graphql)
- [Hydrogen Release Notes](https://hydrogen.shopify.dev/releases)
