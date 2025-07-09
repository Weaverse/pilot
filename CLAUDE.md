# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Pilot**, a Shopify Hydrogen theme powered by Weaverse - a visual page builder for Hydrogen storefronts. The project is built with React, TypeScript, Remix, and Tailwind CSS.

## Essential Commands

### Development
```bash
npm run dev        # Start development server on port 3456
npm run build      # Production build with GraphQL codegen
npm run preview    # Preview production build
npm start          # Start production server
```

### Code Quality
```bash
npm run biome      # Check for linting/formatting errors
npm run biome:fix  # Fix linting/formatting errors
npm run format     # Format code
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

### Key Architectural Patterns

1. **Weaverse Integration**: Every page route loads Weaverse data alongside GraphQL queries using parallel data loading:
   ```typescript
   const [weaverseData, collections] = await Promise.all([
     context.weaverse.loadPage(),
     storefront.query(COLLECTIONS_QUERY)
   ]);
   ```

2. **Component Structure**:
   - `/app/sections/` - Weaverse visual builder sections with schema exports
   - `/app/components/` - Reusable UI components organized by feature
   - Each Weaverse section exports both the component and a schema for visual editing

3. **Data Fetching**: 
   - GraphQL fragments in `/app/graphql/fragments.ts`
   - Complete queries in `/app/graphql/queries.ts`
   - Route loaders handle all data fetching server-side

4. **Styling**:
   - Tailwind CSS with custom utilities
   - class-variance-authority (cva) for component variants
   - Use the `cn()` utility from `/app/utils/cn.ts` for class merging

5. **Type Safety**:
   - GraphQL types are auto-generated via codegen
   - Path alias `~/` maps to `/app/` directory
   - Strict TypeScript configuration

### Important Integrations

- **Weaverse**: Visual page builder - sections must be registered in `/app/weaverse/components.ts`
- **Judge.me**: Product reviews integration via utilities in `/app/utils/judgeme.ts`
- **Analytics**: Shopify Analytics integrated throughout components
- **Customer Accounts**: New Shopify Customer Account API support

### Development Guidelines

1. **Adding New Sections**: 
   - Create folder in `/app/sections/`
   - Export component and schema
   - Register in `/app/weaverse/components.ts`

2. **Route Data Loading**:
   - Always load Weaverse data in route loaders
   - Use parallel loading with `Promise.all()`
   - Set appropriate cache headers

3. **Component Patterns**:
   - Use TypeScript for all new components
   - Follow existing schema patterns for Weaverse sections
   - Implement proper loading states with Suspense

4. **GraphQL Usage**:
   - Add fragments to `/app/graphql/fragments.ts`
   - Run `npm run codegen` after GraphQL changes
   - Two separate codegen outputs:
     - `storefront-api.generated.d.ts` - For all storefront queries (excludes account routes)
     - `customer-account-api.generated.d.ts` - For customer account queries (only in `*.account*.{ts,tsx,js,jsx}` files)
   - Place customer account queries ONLY in account-related route files

### Environment Configuration

The project uses environment variables for Shopify integration. Required variables are defined in `env.d.ts`.

### Testing Approach

E2E tests use Playwright and are located in `/tests/`. Tests run against `localhost:3000` and focus on critical user flows like cart operations.