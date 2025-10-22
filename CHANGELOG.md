# Changelog

All notable changes to **Pilot** - a production-ready Shopify Hydrogen theme built with Weaverse.

## v7.1.0 - 2025-10-22

### Patch Changes

- Fix minor bugs by @hta218 in #328
- Update mega menu by @hta218 in #329
- Update @shopify/hydrogen to v2025.7.0 by @hta218 in #330
- Updated dependencies

## v7.0.0 - 2025-10-10

### Major Changes

- **Routing System Refactoring**: Migrated from flat file-based routing to routes definitions in `routes.ts` for improved flexibility and maintainability
- **Component Improvements**:
  - Refactored AccountDetails component with improved form handling
  - Enhanced AddressBook management
  - Updated OrdersHistory component with better data handling
  - Improved profile update form styling
- **TypeScript & Type Safety**:
  - Updated type definitions across account routes
  - Fixed type inconsistencies in action functions
  - Improved review item types
- **GraphQL Optimizations**:
  - Enhanced parallel loading patterns
  - Improved query efficiency
  - Better error handling in GraphQL operations
- **Code Quality**:
  - Fixed import paths for ORDER_STATUS
  - Cleaned up discount route files
  - Removed unused storefront-api.generated.d.ts files
  - Better adherence to project conventions

## v6.0.3 - 2025-10-06

### Patch Changes

- Update Weaverse package to v5.5.0 by @paul-phan in #325
- Refactored PredictiveSearchButton layout and repositioned PopularKeywords component by @hta218
- Added variant prices display and integrated JudgemeStarsRating in SingleProduct component by @hta218
- Updated default onClickEvent value to "scroll-to-section" in JudgemeStarsRating schema by @hta218
- Refactored loading state layout in JudgemeStarsRating component for improved styling by @hta218
- Refactored SingleProduct component by removing unused children prop and childTypes from schema by @hta218
- Enhanced ProductCard and ProductMedia components with view transition effects for improved user experience by @hta218
- Removed unused NavLink component and updated ProductCard to use Link component instead by @hta218
- Fix Link component to return null if missing children or text by @hta218 in #326

## v6.0.0 - 2025-09-23

### Major Changes

- **Refactored component architecture**: Removed forwardRef pattern from most components, simplifying props handling and improving maintainability
- **Enhanced Judge.me integration**: Restructured API routes for better reviews handling with new endpoint structure
- **Improved state management**: Replaced React context with Zustand store for product quantity management
- **Code organization**: Moved RevealUnderline component to proper components directory for better structure

### Features

- **Featured Products enhancements**: Added collection and manual product selection options alongside auto (best selling) mode
- **Enhanced product badges**: Added support for polymorphic components with `as` prop for flexible rendering
- **Improved product quantity component**: Added customizable label prop for better flexibility

### Bug Fixes

- Fixed import paths for RevealUnderline component across multiple files
- Removed unnecessary Biome ignore comments for console.error statements
- Fixed spacing and formatting issues in various components
- Updated API route structure for better organization

### Dependencies

- Updated @weaverse/hydrogen to latest version

## v5.5.0 - 2025-08-13

### Patch Changes

- Combined Listings by @hta218 in #317
- Updated dependencies

## v5.4.0 - 2025-07-22

### Patch Changes

- Shopify Bundles by @hta218 in #313
- Updated dependencies

## v5.3.1 - 2025-07-18

### Patch Changes

- Update product card, media zoom by @hta218 in #307
- Add Claude Code GitHub Workflow by @hta218 in #308
- Add `NewsletterPopup` feature with Weaverse integration by @hta218 in #309
- Update `biome` config and apply formatting by @paul-phan in #310
- Downgrade React Player to version 2.16.0 by @hta218 in #312

## v5.3.0 - 2025-07-10

### Features

- Added Quick Shop functionality with modal/drawer support for instant product preview
- Introduced new `VariantSelector` component for better variant selection UX
- Added image loading states to product cards

### Improvements

- Replaced custom modals with Radix UI Dialog components
- Enhanced product card variant handling and responsiveness
- Added `.editorconfig` for consistent code formatting
- Improved image aspect ratio calculations with new utility functions

### Removed

- Deprecated components: `ProductForm`, `SingleProductVariantSelector`, and custom `Modal`

### UI/UX

- Better loading skeletons with visual feedback
- Consistent class ordering across project

## v5.2.1 - 2025-07-01

### Patch Changes

- Update hero video section by @hta218 in #302
- Fix SingleProduct section, update Weaverse components' types by @hta218 in #303
- Handle variant selector for Single Product section by @hta218 in #304
- Remove hideUnavailableOptions from SingleProductData and schema by @hta218 in #305

## v5.2.0 - 2025-06-30

### Patch Changes

- Update types by @paul-phan in #297
- Hydrogen 2025.1.4 updates by @hta218 in #300
- Updated dependencies

## v5.1.6 - 2025-06-12

### Patch Changes

- TailwindCSS v4 & inspector to settings migration by @paul-phan in #295
- change HydrogenComponentSchema to `createSchema` by @paul-phan in #296
- Update docs, update new schema creation by @hta218 in #298
- Update @weaverse/hydrogen by @hta218 in #299

## v5.1.0 - 2025-06-05

### Patch Changes

- Migrate to React 19 & React Router v7 by @paul-phan in #288
- Update biome version to 2.0.0-beta.5 by @paul-phan in #291
- Tailwindcss v4 by @hta218 in #290

## v5.0.0 - 2025-05-27

### Major Changes

- Upgrade to React Router v7 & React 19 support

## v3.5.5 - 2025-04-15

### Patch Changes

- Center images in typography using Tailwind config by @hta218 in #271
- Update support Remix singleFetch by @paul-phan in #274
- Fix country selector by @hta218 in #275
- Fix outline style in VariantOption component by @hta218 in #278

## v3.5.2 - 2025-02-13

### Patch Changes

- Enhance media zoom modal by @hta218 in #266
- Update image usages by @hta218 in #267
- Update collection list and blog list by @hta218 in #270

## v3.5.0 - 2025-02-05

### Patch Changes

- Add product cards & badges settings, update product card display by @hta218 in #259
- Add blurry loading effect `Image`, enhance product card & badges style by @hta218 in #260
- Add types for image, update product card images transition by @hta218 in #261
- Fix image loading state when being cached by browser & fix badge style by @hta218 in #262
- Update product card content layout, update collection filters schema by @hta218 in #263

## v3.4.2 - 2024-12-27

### Patch Changes

- Refine collection page, update sections by @hta218 in #252
- Update README with new demo images by @hta218 in #254
- Update SEO, update judgeme reviews, fix minor bugs by @hta218 in #255
- Update codegen configs, update deps, make filters sticky & add Product Card settings by @hta218 in #256
- Update swatches configs query and render in filter and variant option component by @hta218 in #257
- Add a flag to prioritize custom color over variant image by @hta218 in #258

## v3.3.0 - 2024-12-23

### Patch Changes

- Upgrade deps by @paul-phan in #247
- Update newsletter form, integrate with Klaviyo by @viethung26 in #248
- Update account page, refactor theme, update tailwind & vite configs by @hta218 in #249
- Update customer address form, update button animation config by @hta218 in #250
- Update order & collection list routes by @hta218 in #251

## v3.2.3 - 2024-12-17

### Patch Changes

- Prevent scroll reset when using price range or clear filters by @hta218 in #238
- Clean up theme by @hta218 in #239
- Fix filters and update banner height in collection details page by @hta218 in #240
- Restructuring theme, remove unused module components by @hta218 in #241
- Update all products route layout by @hta218 in #242
- Update search page layout, update routes' breadcrumb by @hta218 in #243
- Update search page & predictive search, simplify structure, fix minor bugs by @hta218 in #244
- Update footer newsletter by @hta218 in #245
- Fix search page, fix get colors configs from metaobject, update policies and regular pages layout by @hta218 in #246

## v3.2.2 - 2024-12-14

### Patch Changes

- Simplify header, clean up theme by @hta218 in #234
- Add more settings for collection details, fix header style by @hta218 in #235
- Use `metaobject` entries for colors swatches by @hta218 in #236
- Refactor price range component to handle no price filter in params by @hta218 in #237

## v3.2.1 - 2024-12-13

### Patch Changes

- Add option to display color filters as swatches by @hta218 in #230
- Fix header issues by @hta218 in #231
- Add clear filters functionality, update filters styles by @hta218 in #232
- Improve collection filters, fix minor bugs by @hta218 in #233

## v3.2.0 - 2024-12-10

### Patch Changes

- Refine theme by @hta218 in #226
- Update collection filters by @hta218 in #227
- Update package lock file by @hta218 in #228
- Update products pagination by @hta218 in #229

## v3.1.0 - 2024-11-26

### Patch Changes

- Fix minor style judgeme review section by @dangthang1903 in #216
- Update Judgeme reviews design when review not found by @dangthang1903 in #217
- deps: update to Hydrogen 2024.10 by @paul-phan in #219
- Add support for animations by @viethung26 in #220
- Update menu functionality by @hta218 in #225

## v3.0.3 - 2024-10-16

### Patch Changes

- Refactoring sections by @hta218 in #207
- Update account pages by @viethung26 in #208
- Fix bug swiper for product media by @dangthang1903 in #209
- Fix product loaded on scroll by @paul-phan in #210
- Update product card & quick shop by @hta218 in #211
- Update judgeme review with new design by @dangthang1903 in #212
- Fix issue style judgeme review by @dangthang1903 in #214

## v3.0.2 - 2024-09-06

### Patch Changes

- Fix cart logic by @hta218 in #204
- Update csp configs by @paul-phan in #205

## v3.0.1 - 2024-08-20

### Patch Changes

- Update desktop menu by @viethung26 in #194
- Refactor project structure by @hta218 in #199

## v2.8.2 - 2024-08-15

### Patch Changes

- Add Header & Footer by @viethung26 in #184
- Add Marquee component by @viethung26 in #185
- Fix announcement bar by @viethung26 in #186
- Update to latest Hydrogen & Weaverse (August 2024) by @paul-phan in #190
- Optimize configs by @viethung26 in #191
- Cleaning up by @paul-phan in #192

## v2.7.7 - 2024-07-30

### Patch Changes

- Update footer by @viethung26 in #182

## v2.7.6 - 2024-07-25

### Patch Changes

- Add view transition for product image by @paul-phan in #178
- Optimize pdp rendering by @paul-phan in #179
- Update sections presets and structure by @hta218 in #180
- Add `NewsLetter` section by @hta218 in #181

## v2.7.4 - 2024-07-21

### Patch Changes

- Update Product Media to use `swiper` slider by @hta218 in #177

## v2.7.3 - 2024-07-19

### Patch Changes

- Update Header by @viethung26 in #167
- Update linters by @paul-phan in #169
- Update sections by @hta218 in #170
- Refactoring by @hta218 in #171
- Update header by @viethung26 in #168
- Fix minor bugs by @hta218 in #172
- Update header by @hta218 in #173
- Hydrogen 2024-07 by @paul-phan in #174
- Upgrade Hydrogen to v2024-7 by @paul-phan in #175
- Update theme settings by @hta218 in #176

## v2.6.17 - 2024-07-08

### Patch Changes

- Update header, drawer and filter by @viethung26 in #165
- Fix `HeroVideo` SSR issue by @hta218 in #166

## v2.6.16 - 2024-07-07

### Patch Changes

- Update sections by @hta218 in #135
- Revert @shopify/hydrogen back to 2024.4.1 since it bug in Windows by @paul-phan in #136
- revert cli-hydrogen to v8.0.4 by @paul-phan in #137
- update Hydrogen v2024.4.4 (but keep cli-hydrogen v8.0.4) by @paul-phan in #139
- update header by @viethung26 in #140
- Apply optimistic cart by @paul-phan in #141
- fix cart style by @paul-phan in #145
- Update Hydrogen v2024.4.7 by @paul-phan in #146
- update drawer and header by @viethung26 in #150
- update menu by @viethung26 in #151
- Update components schema. add `Featured Collections` section by @hta218 in #155
- update header by @viethung26 in #159
- fix drawer by @viethung26 in #160
- Update sections by @hta218 in #163

## v2.6.14 - 2024-06-09

### Patch Changes

- Fix missing styleSrc from Weaverse by @paul-phan in #133
- Update `weaverse` package, fix loader func type by @hta218 in #134

## v2.6.13 - 2024-06-07

### Patch Changes

- Update sections by @hta218 in #126
- add predictive search by @viethung26 in #125
- Refactor, Add predictive search by @paul-phan in #127
- add quick modal and update header by @viethung26 in #130

## v2.6.10 - 2024-05-26

### Patch Changes

- Add global loading component by @paul-phan in #111
- Update to latest Hydrogen version by @paul-phan in #113
- Refactor by @paul-phan in #115
- Weaverse v3.1.7 by @paul-phan in #116
- Update .gitignore to include pnpm lock file by @hta218 in #118
- Refactor, update Weaverse v3.1.9 by @paul-phan in #120
- Refactoring theme, update sections by @hta218 in #121

## v2.6.5 - 2024-04-26

### Patch Changes

- add contact form by @viethung26 in #103
- Migrate to Vite by @paul-phan in #106
- Update Cart & New Analytics integration by @paul-phan in #107
- Update theme schema & atom components by @hta218 in #109

## v2.5.3 - 2024-04-11

### Patch Changes

- Add Product List demo by @paul-phan in #100
- Add /cart/add route by @paul-phan in #101
- Update image hotspot and description by @dangthang1903 in #102
- Refactor components/sections by @hta218 in #104

## v2.5.1 - 2024-02-28

### Patch Changes

- Update `@weaverse/hydrogen` dependency by @hta218 in #98

## v2.5.0 - 2024-02-28

### Patch Changes

- Weaverse SDKs v2.8.11 by @paul-phan in #77
- Fix Single product demo by @paul-phan in #79
- Experimenting View Transition API by @paul-phan in #81
- Replace google font with @fontsource/roboto by @paul-phan in #82
- Add package-lock.json file as npm ci will require it for build by @paul-phan in #83
- Update product page by @viethung26 in #85
- Add more sections/components by @paul-phan in #87
- Weaverse SDKs v2.9.0 by @paul-phan in #88
- Ignore script by default since we got bug throw from @shopify/oxygen by @paul-phan in #89
- Fix minor bugs by @viethung26 in #90
- Update support for custom page template by @paul-phan in #93
- Fix Input type prop not being passed by @paul-phan in #94
- Update project to use new Customer Account API by @paul-phan in #95

## v2.4.2 - 2024-01-09

### Patch Changes

- Update collection header section by @dangthang1903 in #53
- Add count down section by @dangthang1903 in #52
- Add deploy to Vercel button by @paul-phan in #55
- Update more sections by @dangthang1903 in #57
- add swatches by @viethung26 in #62
- update swatch by @viethung26 in #64
- update Weaverse SDKs v2.8.1 by @paul-phan in #65
- Update more sections and add component button by @dangthang1903 in #58
- add product media by @viethung26 in #67
- Update image with text section by @dangthang1903 in #68
- remove git-hooks by @paul-phan in #69
- fix minor bug by @viethung26 in #71
- Update toolbar for child components by @dangthang1903 in #74
- add metaobject demo section by @viethung26 in #75

## v2.3.1 - 2023-11-19

### Patch Changes

- Refactoring sections
- Add `Single Product` component
- Integrating with Judgeme reviews app
- Updating weaverse sdks

## v2.3.0 - 2023-11-06

### Minor Changes

- Upgrade to `remix@v2`
- Add more sections
- Fix minor bugs

## v2.2.4 - 2023-10-07

### Patch Changes

- Upgrade `@weaverse/hydrogen` to `v2.1.2`
- Save `cache` & `waitUntil` to weaverse client
- Fix the Pagination component to use `forwardRef`
- Enhance Cart with Optimistic UI

## v2.2.3 - 2023-10-06

### Minor Changes

- Upgrade `@weaverse/hydrogen` to `v2.1.0`
- Load Weaverse's page **without** needing to pass loader's `args`
- `weaverse` client is now available in component's loader function
- Added 2 new sections: **Collection Hero** & **Hero Image** by @dangthang1903
