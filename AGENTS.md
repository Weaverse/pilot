# AGENTS.md

This file provides guidance to AI agents (Claude, GitHub Copilot, Cursor, etc.) when working with code in this repository.

## Project Overview

This is **Pilot**, a Shopify Hydrogen theme powered by Weaverse - a visual page builder for Hydrogen storefronts. The project is built with React 19, TypeScript, React Router 7, and Tailwind CSS v4. It runs on Node.js 20+ and uses Biome for linting/formatting.

## Quick Start

### First Time Setup

1. **Prerequisites**:
   - Node.js 20.0.0 or higher
   - npm (comes with Node.js)
   - Shopify store credentials (for `.env` configuration)

2. **Installation**:
   ```bash
   # Clone and install dependencies
   npm install

   # Copy environment template
   cp .env.example .env

   # Edit .env with your Shopify store credentials
   # Required: PUBLIC_STORE_DOMAIN, SESSION_SECRET,
   # PUBLIC_STOREFRONT_API_TOKEN, PRIVATE_STOREFRONT_API_TOKEN
   ```

3. **Start Development**:
   ```bash
   # Start dev server (runs on http://localhost:3456)
   npm run dev

   # In a separate terminal, run type checking
   npm run typecheck
   ```

4. **Before First Commit**:
   ```bash
   # Always run these before committing
   npm run biome:fix    # Fix formatting and linting
   npm run typecheck    # Verify no type errors
   npm run build        # Ensure production build works
   ```

### Development Ports
- **Development server**: `http://localhost:3456` (via `npm run dev`)
- **Preview server**: `http://localhost:3000` (via `npm run preview`)
- **E2E tests**: Run against preview server on port 3000

## Essential Commands

### Development
```bash
npm run dev        # Start development server on port 3456
npm run dev:ca     # Start with customer account push (unstable - for testing new Customer Account API features)
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

### GraphQL
```bash
npm run codegen    # Generate TypeScript types from GraphQL
```

## Architecture Overview

### Route Structure
Routes are defined in `app/routes.ts` using React Router v7's programmatic routing with Hydrogen's `hydrogenRoutes` wrapper (migrated from flat file-based routing in v7.0.0). All routes support internationalization via the `:locale?` prefix:
- Homepage: `routes/home.tsx`
- Products: `routes/products/product.tsx` (`:productHandle`)
- Collections: `routes/collections/collection.tsx` (`:collectionHandle`)
- Account: `routes/account/*` (layout-based with nested routes)
- API routes: `routes/api/*`
- Cart operations: `routes/cart/*`
- Policies & Pages: `routes/pages/regular-page.tsx`, `routes/policies/policy.tsx`
- Blogs: `routes/blogs/blog.tsx`, `routes/blogs/article.tsx`
- SEO: `routes/seo/robots.ts`, `routes/seo/sitemap.ts`

**Adding New Routes**: Always add new routes to `app/routes.ts` using the `route()`, `index()`, `layout()`, and `prefix()` helpers from `@react-router/dev/routes`.

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
- **Combined Listings**: Intelligent product grouping system via utilities in `/app/utils/combined-listings.ts`
- **Analytics**: Shopify Analytics integrated throughout components
- **Customer Accounts**: New Shopify Customer Account API support (OAuth-based)
- **Radix UI**: For accessible UI primitives (accordion, dialog, dropdown, etc.)
- **Swiper**: For carousel/slideshow functionality
- **Framer Motion**: For smooth animations and transitions
- **Zustand**: For lightweight state management
- **React Use**: Collection of React hooks for common use cases

### Weaverse Section Development

1. **Creating a New Section**:
  ```typescript
  // app/sections/my-section/index.tsx
  import { createSchema, type HydrogenComponentProps } from '@weaverse/hydrogen';
  import type { ComponentRef } from 'react';

  interface MyProps extends HydrogenComponentProps {
    heading: string;
    ref?: React.Ref<HTMLDivElement>;
  }

  const MySection = ({ ref, ...props }: MyProps) => {
    // Component implementation
  };

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

  // Parallel data loading with error handling
  const [shopifyData, weaverseData, thirdPartyData] = await Promise.all([
    storefront.query(QUERY, { variables }).catch((error) => {
      console.error('Storefront query failed:', error);
      // Option 1: Return null for optional data
      return null;
      // Option 2: Throw for critical data
      // throw new Response('Service unavailable', { status: 503 });
    }),
    weaverse.loadPage({ type: "PAGE_TYPE", handle }).catch((error) => {
      console.error('Weaverse page load failed:', error);
      return null; // Graceful degradation - page works without Weaverse data
    }),
    fetchThirdPartyData().catch((error) => {
      console.error('Third party API failed:', error);
      return { data: [] }; // Return empty fallback
    }),
  ]);

  // Handle critical failures
  if (!shopifyData?.resource) {
    throw new Response("Not found", { status: 404 });
  }

  // Optional: Log missing non-critical data
  if (!weaverseData) {
    console.warn(`Weaverse data unavailable for ${handle}`);
  }

  return data({
    shopifyData,
    weaverseData,
    thirdPartyData,
  });
}

// Export headers for cache control
export const headers = routeHeaders;
```

### Error Handling Patterns

**1. Graceful Degradation**
```typescript
// Load optional data with fallbacks
const [productData, reviews] = await Promise.all([
  storefront.query(PRODUCT_QUERY, { variables }),
  getJudgeMeProductReviews({ context, handle }).catch(() => {
    return { reviews: [], rating: 0 }; // Fallback if reviews fail
  }),
]);

// Component can still render without reviews
```

**2. Critical vs Non-Critical Failures**
```typescript
const [criticalData, optionalData] = await Promise.all([
  // Critical: throw on failure
  storefront.query(PRODUCT_QUERY, { variables }).catch((error) => {
    console.error('Critical query failed:', error);
    throw new Response('Product unavailable', { status: 503 });
  }),
  // Optional: return fallback on failure
  loadOptionalData().catch((error) => {
    console.error('Optional data failed:', error);
    return null;
  }),
]);
```

**3. Retry Logic for Transient Failures**
```typescript
async function queryWithRetry<T>(
  queryFn: () => Promise<T>,
  maxRetries = 2,
  delay = 1000,
): Promise<T | null> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await queryFn();
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      if (attempt === maxRetries) {
        return null; // Or throw depending on criticality
      }
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  return null;
}

// Usage in loader
const productData = await queryWithRetry(() =>
  storefront.query(PRODUCT_QUERY, { variables })
);
```

**4. Error Boundaries in Components**
```typescript
// Use React Router's error boundaries
export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Unexpected Error</h1>
      <p>Something went wrong. Please try again later.</p>
    </div>
  );
}
```

**5. Shopify API Rate Limiting**
```typescript
// Handle 429 (Too Many Requests) responses
try {
  const data = await storefront.query(QUERY, { variables });
  return data;
} catch (error) {
  if (error?.response?.status === 429) {
    // Wait for retry-after header or default delay
    const retryAfter = error.response.headers.get('Retry-After') || 5;
    await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
    // Retry once
    return await storefront.query(QUERY, { variables });
  }
  throw error;
}
```

### Combined Listings Integration

Combined Listings allow intelligent product grouping and filtering:

```typescript
// Use utility functions from app/utils/combined-listings.ts
import { isCombinedListing, shouldFilterCombinedListings } from '~/utils/combined-listings';

// In product queries and loaders
const filteredProducts = products.filter(product =>
  !shouldFilterCombinedListings(product, settings)
);

// In components
if (isCombinedListing(product)) {
  // Handle combined listing display differently
}
```

Key integration points:
- Product loaders filter combined listings based on settings
- Cart functionality handles combined products specially
- Product display components check for combined listing status
- Featured products support both collection-based and manual selection

### Environment Configuration

Required environment variables are defined in `env.d.ts`. The project uses `@shopify/hydrogen` and `@shopify/remix-oxygen` for environment handling.

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

## Troubleshooting

### Common Development Issues

**1. GraphQL Type Errors After Query Changes**
```bash
# Error: Property 'xyz' does not exist on type...
# Solution: Regenerate TypeScript types from GraphQL schemas
npm run codegen
```

**2. Dev Server Port Already in Use**
```bash
# Error: EADDRINUSE: address already in use :::3456
# Solution: Kill the process using the port
lsof -ti:3456 | xargs kill -9
# Or use a different port
npm run dev -- --port 3457
```

**3. Weaverse Section Not Appearing in Builder**
- Check: Is the section registered in `/app/weaverse/components.ts`?
- Check: Does the section export both default component and `schema`?
- Check: Is the schema `type` property unique?
- Solution: Restart dev server after registering new sections

**4. Shopify API Authentication Errors**
```bash
# Error: Storefront API authentication failed
# Check .env file has correct values:
# - PUBLIC_STORE_DOMAIN (format: yourstore.myshopify.com)
# - PUBLIC_STOREFRONT_API_TOKEN (public token)
# - PRIVATE_STOREFRONT_API_TOKEN (admin token)
# Solution: Verify tokens in Shopify Admin > Settings > Apps and sales channels
```

**5. Build Fails But Dev Server Works**
```bash
# Error: Build fails with type errors or import issues
# Causes:
# - Missing GraphQL codegen
# - Unused imports (Biome strict mode)
# - Incorrect path aliases
# Solutions:
npm run codegen        # Regenerate types
npm run biome:fix      # Fix linting issues
npm run typecheck      # Find type errors
```

**6. Customer Account Routes Failing**
```bash
# Error: Customer account queries not working
# Check:
# - File naming: Must include 'account' (e.g., account.tsx, user.account.tsx)
# - Import from correct generated types file
# - Using customer account context, not storefront context
# Solution: Use customer-account-api.generated.d.ts types in account routes
```

**7. Parallel Data Loading Failures**
```typescript
// Problem: One API call fails, entire loader fails
// Solution: Add error handling to Promise.all()

const [shopifyData, weaverseData, reviews] = await Promise.all([
  storefront.query(QUERY).catch(err => {
    console.error('Shopify query failed:', err);
    return null; // Return fallback
  }),
  weaverse.loadPage({ type, handle }).catch(err => {
    console.error('Weaverse load failed:', err);
    return null;
  }),
  getJudgeMeProductReviews({ context, handle }).catch(err => {
    console.error('Reviews failed:', err);
    return { reviews: [] };
  }),
]);

// Check for critical failures
if (!shopifyData?.product) {
  throw new Response("Product not found", { status: 404 });
}
```

**8. E2E Tests Failing Locally**
```bash
# Error: Tests timeout or fail to connect
# Cause: Preview server not running or wrong port
# Solution: Tests auto-start preview server, but verify:
npm run build          # Build first
npm run preview        # Manually test preview server
npm run e2e            # Run tests (auto-starts preview if needed)
```

**9. Biome Formatting Conflicts**
```bash
# Error: Biome reports formatting errors after formatting
# Cause: Editor auto-format conflicts with Biome config
# Solution: Disable other formatters (Prettier, ESLint) in IDE
# Use only Biome for this project
npm run biome:fix      # Let Biome fix everything
```

**10. Image Loading Issues in Development**
```bash
# Error: Images from Shopify CDN not loading
# Cause: CSP (Content Security Policy) restrictions
# Solution: Check vite.config.ts has correct image domains configured
# Shopify CDN domains should be allowed in dev server
```

### Quick Diagnostic Commands

```bash
# Check current git status
git status

# Verify Node.js version (should be 20+)
node --version

# Check for syntax errors
npm run biome

# Verify all types are correct
npm run typecheck

# Test production build
npm run build

# Clear all caches and rebuild
npm run clean && npm install && npm run build
```

### Getting Help

- **GraphQL Issues**: Check Shopify's GraphQL Admin API documentation
- **Weaverse Issues**: Check Weaverse documentation or contact support
- **React Router Issues**: Check React Router v7 migration guide
- **Hydrogen Issues**: Check @shopify/hydrogen changelog and GitHub issues

## Common Pitfalls to Avoid

1. **GraphQL Codegen**: Always run `npm run codegen` after modifying GraphQL queries/fragments
2. **Route Registration**: New routes must be added to `/app/routes.ts` (not file-based routing anymore)
3. **Weaverse Registration**: New sections must be registered in `/app/weaverse/components.ts`
4. **Route Caching**: Use `routeHeaders` export for consistent cache control
5. **Customer Account Queries**: Only use in `*.account*.{ts,tsx,js,jsx}` files - this naming pattern is critical
6. **Parallel Loading**: Always use `Promise.all()` for multiple data fetches in loaders
7. **Type Safety**: Avoid `any` type when possible, use `unknown` if escape hatch needed, properly type all Weaverse section props
8. **Combined Listings**: Use utility functions from `/app/utils/combined-listings.ts` for product filtering and grouping logic
9. **Package Manager**: Use npm (not pnpm) - the project is configured for npm package management

## Development Setup Requirements

### Node.js and Dependencies
- **Node.js**: Version 20.0.0 or higher required
- **Package Manager**: npm (configured in package.json, don't use pnpm)
- **Environment**: Copy `.env.example` to `.env` and configure Shopify store credentials

### Key Configuration Files
- **react-router.config.ts**: React Router v7 configuration (SSR enabled, app directory structure, Hydrogen preset)
- **vite.config.ts**: Includes Hydrogen, Oxygen, Tailwind CSS v4, and development server warmup
- **biome.json**: Code quality configuration extending from `ultracite` and `@weaverse/biome`
- **codegen.ts**: GraphQL code generation for Shopify Storefront and Customer Account APIs
- **tsconfig.json**: TypeScript config with `~/` path alias, strict mode disabled for compatibility
- **.env.example**: Template for environment configuration (copy to `.env` for local development)
