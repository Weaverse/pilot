# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Pilot**, a Shopify Hydrogen theme powered by Weaverse - a visual page builder for Hydrogen storefronts. The project is built with React, TypeScript, React Router 7, and Tailwind CSS v4. It runs on Node.js 20+ and uses Biome for linting/formatting.

## Essential Commands

### Development
```bash
npm run dev        # Start development server on port 3456
npm run dev:ca     # Start with customer account push (unstable)
npm run build      # Production build with GraphQL codegen
npm run preview    # Preview production build
npm start          # Start production server
npm run clean      # Clean all build artifacts and dependencies
```

### Code Quality (Always run before committing)
```bash
npm run biome      # Check for linting/formatting errors
npm run biome:fix  # Fix linting/formatting errors
npm run format     # Format code with Biome
npm run typecheck  # Run TypeScript type checking
```

### Testing
```bash
npm run e2e        # Run Playwright E2E tests
npm run e2e:ui     # Run tests with UI mode
```

### GraphQL
```bash
npm run codegen    # Generate TypeScript types from GraphQL
```

## Architecture Overview

### Route Structure
All routes follow the pattern `($locale).{route}.tsx` to support internationalization:
- Homepage: `($locale)._index.tsx`
- Products: `($locale).products.$productHandle.tsx`
- Collections: `($locale).collections.$collectionHandle.tsx`
- Account: `($locale).account.*`
- API routes: `($locale).api.*`
- Cart operations: `($locale).cart.*`
- Policies & Pages: `($locale).pages.$pageHandle.tsx`, `($locale).policies.$policyHandle.tsx`

### Key Architectural Patterns

1. **Parallel Data Loading**: Every page route loads Weaverse data alongside GraphQL queries using `Promise.all()`:
   ```typescript
   const [{ shop, product }, weaverseData, productReviews] = await Promise.all([
     storefront.query(PRODUCT_QUERY, { variables }),
     weaverse.loadPage({ type: "PRODUCT", handle }),
     getJudgeMeProductReviews({ context, handle }),
   ]);
   ```

2. **Component Structure**:
   - `/app/sections/` - Weaverse visual builder sections with schema exports and optional loaders
   - `/app/components/` - Reusable UI components organized by feature (cart/, product/, layout/, customer/)
   - Each Weaverse section must export: default component + schema + optional loader

3. **Data Fetching**:
   - GraphQL fragments in `/app/graphql/fragments.ts`
   - Complete queries in `/app/graphql/queries.ts`
   - Route loaders handle all data fetching server-side
   - Use `routeHeaders` for consistent cache control

4. **Styling**:
   - Tailwind CSS v4 with custom utilities
   - class-variance-authority (cva) for component variants
   - Use the `cn()` utility from `/app/utils/cn.ts` for class merging
   - Biome's `useSortedClasses` enabled for `clsx`, `cva`, and `cn` functions

5. **Type Safety**:
   - GraphQL types are auto-generated via codegen
   - Path alias `~/` maps to `/app/` directory
   - Strict TypeScript configuration
   - Two separate codegen outputs:
     - `storefront-api.generated.d.ts` - For all storefront queries (excludes account routes)
     - `customer-account-api.generated.d.ts` - For customer account queries (only in `*.account*.{ts,tsx,js,jsx}` files)

### Important Integrations

- **Weaverse**: Visual page builder - sections must be registered in `/app/weaverse/components.ts`
- **Judge.me**: Product reviews integration via utilities in `/app/utils/judgeme.ts`
- **Analytics**: Shopify Analytics integrated throughout components
- **Customer Accounts**: New Shopify Customer Account API support (OAuth-based)
- **Radix UI**: For accessible UI primitives (accordion, dialog, dropdown, etc.)
- **Swiper**: For carousel/slideshow functionality

### Weaverse Section Development

1. **Creating a New Section**:
   ```typescript
   // app/sections/my-section/index.tsx
   import { createSchema, type HydrogenComponentProps } from '@weaverse/hydrogen';
   import { forwardRef } from 'react';
   
   interface MyProps extends HydrogenComponentProps {
     heading: string;
   }
   
   const MySection = forwardRef<HTMLElement, MyProps>((props, ref) => {
     // Component implementation
   });
   
   export default MySection;
   
   export const schema = createSchema({
     type: 'my-section',
     title: 'My Section',
     settings: [/* ... */]
   });
   
   // Optional loader for server-side data fetching
   export const loader = async ({ weaverse, data }) => {
     // Fetch data
   };
   ```

2. **Register in `/app/weaverse/components.ts`**:
   ```typescript
   import * as MySection from "~/sections/my-section";
   export const components = [
     // ... existing components
     MySection,
   ];
   ```

### Route Data Loading Pattern

```typescript
export async function loader({ params, request, context }: LoaderFunctionArgs) {
  const { handle } = params;
  invariant(handle, "Missing handle param");
  
  const { storefront, weaverse } = context;
  
  // Parallel data loading
  const [shopifyData, weaverseData, thirdPartyData] = await Promise.all([
    storefront.query(QUERY, { variables }),
    weaverse.loadPage({ type: "PAGE_TYPE", handle }),
    fetchThirdPartyData(),
  ]);
  
  // Handle errors
  if (!shopifyData.resource) {
    throw new Response("Not found", { status: 404 });
  }
  
  return data({
    shopifyData,
    weaverseData,
    thirdPartyData,
  });
}
```

### Environment Configuration

Required environment variables are defined in `env.d.ts`. The project uses `@shopify/hydrogen` and `@shopify/remix-oxygen` for environment handling.

### Testing Strategy

- E2E tests use Playwright and are located in `/tests/`
- Tests run against `localhost:3456` (same as dev server)
- Focus on critical user flows: cart operations, checkout process
- Run individual tests: `npx playwright test tests/cart.test.ts`

### Biome Configuration

The project extends from `ultracite` and `@weaverse/biome` configurations with these customizations:
- Double quotes for strings
- Semicolons always
- Trailing commas
- Max cognitive complexity: 50
- Sorted Tailwind classes in `clsx`, `cva`, and `cn` functions

## Code Conventions

- **Naming**: camelCase for variables/functions, PascalCase for components, kebab-case for files, ALL_CAPS for constants
- **Formatting**: 2 spaces indentation, double quotes, semicolons, trailing commas
- **TypeScript**: Always type function parameters and returns, avoid `any`, use interfaces for data structures
- **React**: Functional components with hooks only, small focused components, forwardRef for Weaverse sections
- **Async**: Use async/await, proper error handling with try/catch
- **Imports**: Use `~/` path alias for app directory imports

## Common Pitfalls to Avoid

1. **GraphQL Codegen**: Always run `npm run codegen` after modifying GraphQL queries/fragments
2. **Weaverse Registration**: New sections must be registered in `/app/weaverse/components.ts`
3. **Route Caching**: Use `routeHeaders` export for consistent cache control
4. **Customer Account Queries**: Only use in `*.account*.{ts,tsx}` files
5. **Parallel Loading**: Always use `Promise.all()` for multiple data fetches in loaders
6. **Type Safety**: Never use `any` type, properly type all Weaverse section props
