---
description: 
globs: 
alwaysApply: false
---
# Overview

This rule describes how to integrate "Weaverse" with a Shopify Hydrogen storefront. Below is a "recipe" that contains the steps to apply to a Hydrogen project to achieve the desired outcome.
The same logic can be applied to any Hydrogen storefront project, adapting the implementation details to the specific needs/structure/conventions of the project.

# AI model verification steps

- Never edit generated files (ending with .d.ts) directly; instead, run the `npm run codegen` command to update them.
- Always follow naming conventions for Weaverse components: use PascalCase for component names.
- Keep component-specific types in the same file as the component.
- Ensure all components have proper schema definitions for the Weaverse builder.
- **CRITICAL**: Always use `settings` instead of `inspector` in component and theme schemas. The `inspector` key is deprecated and has been replaced with `settings` for better consistency with industry standards.

# Summary

Integrate Weaverse with your Hydrogen storefront to enable visual page building capabilities without losing code-level control and customization.

# User Intent Recognition

<user_queries>
- How do I integrate Weaverse with my Hydrogen store?
- How do I create Weaverse section components?
- What are the best practices for Weaverse integration with Hydrogen?
- How can I create a custom Weaverse component?
- How do I set up Weaverse theme schema for Hydrogen?
- How to use Weaverse with Hydrogen for page building?
</user_queries>

# Troubleshooting

<troubleshooting>
- **Issue**: The Weaverse content isn't rendering in my Hydrogen store.
  **Solution**: Make sure you've properly set up the WeaverseContent component in your app's root component. Check that you've included the necessary imports from '@weaverse/hydrogen' and applied the withWeaverse HOC to your root App component.

- **Issue**: Component schema isn't showing up in the Weaverse editor.
  **Solution**: Verify that your component is properly registered in the components.ts file and that it exports a valid schema object with the required properties.

- **Issue**: Custom component properties aren't being saved.
  **Solution**: Ensure that your component schema correctly defines all the properties you want to edit, including their proper types and default values.

- **Issue**: Changes made in the Weaverse editor aren't reflected in the Hydrogen store.
  **Solution**: Check that you're correctly passing the Weaverse client in your server.ts file and that the server function returns the proper context.
</troubleshooting>

# Recipe Implementation

<recipe_implementation>

## Description

This recipe integrates Weaverse with your Hydrogen storefront to enable visual page building capabilities. Weaverse is a universal website builder application with deep Shopify integration, focusing on providing a visual builder interface while maintaining code-level control and customization capabilities.

In this recipe, you'll make the following changes:

1. Install and set up the Weaverse SDK for Hydrogen.
2. Configure your Hydrogen app to use Weaverse for page building.
3. Create custom section components that can be managed via the Weaverse editor.
4. Set up the theme schema to define global settings for your Weaverse-powered Hydrogen store.

## Requirements

- A Shopify Hydrogen storefront (created with `@shopify/create-hydrogen` or similar).
- Node.js and npm/yarn/pnpm installed on your development machine.
- A Weaverse account (sign up at [weaverse.io](mdc:workspace/workspace/workspace/workspace/https:/weaverse.io)).

## Project Structure Overview

After integration, your Hydrogen project will include these additional Weaverse-specific files and directories:

```text
🌳 my-hydrogen-project
├── 📁 app/
│   ├── 📁 components/     # Reusable UI components
│   ├── 📁 sections/       # Weaverse section components
│   │   ├── 📁 hero-image/
│   │   │   └── 📄 index.tsx
│   │   ├── 📁 featured-collection/
│   │   │   └── 📄 index.tsx
│   │   └── 📁 ...
│   ├── 📁 weaverse/       # Weaverse configuration
│   │   ├── 📄 components.ts           # Component registry
│   │   ├── 📄 index.tsx               # WeaverseContent component
│   │   ├── 📄 schema.server.ts        # Theme schema definition
│   │   ├── 📄 style.tsx               # Global styles from theme settings
│   │   └── 📄 csp.ts                  # Content security policy
│   └── 📄 root.tsx        # Root component with Weaverse integration
├── 📄 server.ts           # Server with Weaverse client
└── 📄 .env                # Environment variables
```

## New files added to the template by this recipe

### app/weaverse/components.ts

This file registers all your section components for use in the Weaverse editor.

```ts
import type { HydrogenComponent } from "@weaverse/hydrogen";
import * as Heading from "~/components/heading";
import * as Paragraph from "~/components/paragraph";
import * as HeroImage from "~/sections/hero-image";
import * as FeaturedCollection from "~/sections/featured-collection";
import * as ImageWithText from "~/sections/image-with-text";
// Import other components as needed

export let components: HydrogenComponent[] = [
  Heading,
  Paragraph,
  HeroImage,
  FeaturedCollection,
  ImageWithText,
  // Add other components to the array
];
```

### app/weaverse/index.tsx

This file creates the WeaverseContent component that enables the visual editor.

```tsx
import { WeaverseHydrogenRoot } from "@weaverse/hydrogen";
import { GenericError } from "~/components/root/generic-error";
import { components } from "./components";

export function WeaverseContent() {
  return (
    <WeaverseHydrogenRoot
      components={components}
      errorComponent={GenericError}
    />
  );
}
```

### app/weaverse/schema.server.ts

This file defines your theme schema with global settings for the Weaverse editor.

```ts
import type { HydrogenThemeSchema } from "@weaverse/hydrogen";
import pkg from "../../package.json";

export let themeSchema: HydrogenThemeSchema = {
  info: {
    version: pkg.version,
    author: "Your Brand",
    name: "Your Theme Name",
    authorProfilePhoto: "https://cdn.shopify.com/your-logo.png",
    documentationUrl: "https://your-docs-site.com",
    supportUrl: "https://your-support-site.com",
  },
  i18n: {
    defaultLocale: {
      pathPrefix: "",
      label: "United States (USD $)",
      language: "EN",
      country: "US",
      currency: "USD",
    },
    // Add other locales as needed
  },
  settings: [
    {
      group: "Layout",
      inputs: [
        {
          type: "range",
          label: "Page width",
          name: "pageWidth",
          configs: {
            min: 1000,
            max: 1600,
            step: 10,
            unit: "px",
          },
          defaultValue: 1280,
        },
        // Add other layout settings
      ],
    },
    {
      group: "Header",
      inputs: [
        {
          type: "select",
          name: "headerWidth",
          label: "Header width",
          configs: {
            options: [
              { value: "full", label: "Full page" },
              { value: "stretch", label: "Stretch" },
              { value: "fixed", label: "Fixed" },
            ],
          },
          defaultValue: "fixed",
        },
        {
          type: "switch",
          label: "Enable transparent header",
          name: "enableTransparentHeader",
          defaultValue: false,
          helpText: "Header is transparent in home page only.",
        },
        {
          type: "image",
          name: "logoData",
          label: "Logo",
          defaultValue: {
            id: "your-media-id",
            altText: "Logo",
            url: "https://cdn.shopify.com/your-logo.png",
            width: 320,
            height: 116,
          },
        },
        // Add other header settings
      ],
    },
    // Add other settings groups
  ],
  // Additional schema settings
};
```

### app/weaverse/style.tsx

This file provides global styles driven by theme settings.

```tsx
import { useThemeSettings } from "@weaverse/hydrogen";
import { createGlobalStyle } from "styled-components";

export function GlobalStyle() {
  const {
    pageWidth,
    bodyFontFamily,
    bodyFontWeight,
    bodyFontStyle,
    headingFontFamily,
    headingFontWeight,
    headingFontStyle,
    // Access other theme settings
  } = useThemeSettings();

  return (
    <Style
      pageWidth={pageWidth}
      bodyFontFamily={bodyFontFamily}
      bodyFontWeight={bodyFontWeight}
      bodyFontStyle={bodyFontStyle}
      headingFontFamily={headingFontFamily}
      headingFontWeight={headingFontWeight}
      headingFontStyle={headingFontStyle}
      // Pass other theme settings
    />
  );
}

const Style = createGlobalStyle<{
  pageWidth: number;
  bodyFontFamily: string;
  bodyFontWeight: string;
  bodyFontStyle: string;
  headingFontFamily: string;
  headingFontWeight: string;
  headingFontStyle: string;
  // Define other prop types
}>`
  :root {
    --page-width: ${(props) => props.pageWidth}px;
    --body-font-family: ${(props) => props.bodyFontFamily};
    --body-font-weight: ${(props) => props.bodyFontWeight};
    --body-font-style: ${(props) => props.bodyFontStyle};
    --heading-font-family: ${(props) => props.headingFontFamily};
    --heading-font-weight: ${(props) => props.headingFontWeight};
    --heading-font-style: ${(props) => props.headingFontStyle};
    /* Define other CSS variables */
  }

  /* Additional global styles */
`;
```

### app/sections/featured-collection/index.tsx

A complete example of a section component with data fetching capabilities.

```tsx
import clsx from "clsx";
import type { HydrogenComponentProps, ComponentLoaderArgs } from "@weaverse/hydrogen";
import { createSchema } from "@weaverse/hydrogen";
import { forwardRef } from "react";
import { Money, Image, Link } from "@shopify/hydrogen";
import type { CollectionQuery } from "storefrontapi.generated";

// Define the expected props from the schema
type FeaturedCollectionProps = HydrogenComponentProps<{
  collection: { handle: string };
  heading: string;
  productsToShow: number;
  showPrice: boolean;
  showViewAll: boolean;
  sortBy: "BEST_SELLING" | "CREATED_AT" | "PRICE" | "PRICE_DESC";
  columnsDesktop: number;
  columnsMobile: number;
}>;

// Define the loader data format for TypeScript
type LoaderData = {
  collection: CollectionQuery["collection"];
};

export let schema = createSchema({
  type: "featured-collection",
  title: "Featured Collection",
  settings: [
    {
      group: "Content",
      inputs: [
        {
          type: "collection",
          name: "collection",
          label: "Collection",
          // Collection inputs auto-revalidate when changed
        },
        {
          type: "text",
          name: "heading",
          label: "Heading",
          defaultValue: "Featured Collection",
        },
        {
          type: "range",
          name: "productsToShow",
          label: "Products to show",
          defaultValue: 4,
          shouldRevalidate: true, // Will reload data when changed
          configs: {
            min: 2,
            max: 12,
            step: 1,
          },
        },
        {
          type: "toggle",
          name: "showPrice",
          label: "Show price",
          defaultValue: true,
        },
        {
          type: "toggle",
          name: "showViewAll",
          label: "Show 'View all' link",
          defaultValue: true,
        },
        {
          type: "select",
          name: "sortBy",
          label: "Sort products by",
          defaultValue: "BEST_SELLING",
          shouldRevalidate: true, // Will reload data when changed
          configs: {
            options: [
              { value: "BEST_SELLING", label: "Best selling" },
              { value: "CREATED_AT", label: "Newest" },
              { value: "PRICE", label: "Price: Low to high" },
              { value: "PRICE_DESC", label: "Price: High to low" },
            ],
          },
        },
      ],
    },
    {
      group: "Layout",
      inputs: [
        {
          type: "range",
          name: "columnsDesktop",
          label: "Columns (desktop)",
          defaultValue: 4,
          configs: {
            min: 2,
            max: 6,
            step: 1,
          },
        },
        {
          type: "range",
          name: "columnsMobile",
          label: "Columns (mobile)",
          defaultValue: 2,
          configs: {
            min: 1,
            max: 3,
            step: 1,
          },
        },
      ],
    },
  ],
  presets: {
    children: [],
  },
});

// Data fetching loader function
export let loader = async ({
  weaverse,
  data,
}: ComponentLoaderArgs<FeaturedCollectionProps>): Promise<LoaderData | null> => {
  const { storefront } = weaverse;
  const { collection, productsToShow = 4, sortBy = "BEST_SELLING" } = data;

  if (!collection?.handle) {
    return null;
  }

  // Fetch collection data from Shopify
  const response = await storefront.query(COLLECTION_QUERY, {
    variables: {
      handle: collection.handle,
      first: productsToShow,
      sortKey: sortBy,
      language: storefront.i18n.language,
      country: storefront.i18n.country,
    },
    // Use built-in caching
    cache: storefront.CacheLong(),
  });

  return response;
};

// Component implementation
const FeaturedCollection = forwardRef<HTMLDivElement, FeaturedCollectionProps>(
  (props, ref) => {
    const {
      heading,
      showPrice = true,
      showViewAll = true,
      columnsDesktop = 4,
      columnsMobile = 2,
      className,
      loaderData,
    } = props;

    // Get the collection data from the loader
    const collection = loaderData?.collection;

    // If no collection data is available, show a placeholder
    if (!collection) {
      return (
        <div
          ref={ref}
          className={clsx("featured-collection py-8 text-center", className)}
        >
          <div className="container mx-auto">
            <p>Select a collection to display its products</p>
          </div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={clsx("featured-collection py-8", className)}
      >
        <div className="container mx-auto">
          {heading && (
            <h2 className="text-2xl font-bold mb-6 text-center">{heading}</h2>
          )}

          {/* Products grid */}
          <div
            className={clsx(
              "grid gap-4",
              `sm:grid-cols-${columnsMobile}`,
              `lg:grid-cols-${columnsDesktop}`
            )}
          >
            {collection.products.nodes.map((product) => (
              <Link
                key={product.id}
                to={`/products/${product.handle}`}
                className="group product-card"
              >
                <div className="relative overflow-hidden aspect-square rounded-sm bg-gray-100">
                  {product.featuredImage ? (
                    <Image
                      data={product.featuredImage}
                      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                      sizes="(min-width: 1024px) calc(100vw / 4), (min-width: 768px) 50vw, 100vw"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-gray-200">
                      <span className="text-gray-500">No image</span>
                    </div>
                  )}
                </div>

                <div className="mt-3">
                  <h3 className="text-sm font-medium">{product.title}</h3>
                  
                  {showPrice && (
                    <div className="mt-1">
                      <Money
                        data={product.priceRange.minVariantPrice}
                        className="text-sm text-gray-700"
                      />
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* View all link */}
          {showViewAll && (
            <div className="mt-8 text-center">
              <Link
                to={`/collections/${collection.handle}`}
                className="inline-block px-6 py-3 text-sm font-medium text-center text-white bg-gray-900 rounded-sm hover:bg-gray-800"
              >
                View all {collection.title}
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }
);

export default FeaturedCollection;

// GraphQL query for fetching collection data
const COLLECTION_QUERY = `#graphql
  query Collection(
    $handle: String!
    $first: Int
    $sortKey: ProductCollectionSortKeys
    $language: LanguageCode
    $country: CountryCode
  ) @inContext(language: $language, country: $country) {
    collection(handle: $handle) {
      id
      title
      handle
      description
      products(first: $first, sortKey: $sortKey) {
        nodes {
          id
          title
          handle
          featuredImage {
            id
            url
            altText
            width
            height
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
` as const;
```

## Steps

### Step 1: Install Weaverse SDK for Hydrogen

Install the Weaverse SDK for Hydrogen using npm, yarn, or pnpm.

```bash
npm install @weaverse/hydrogen
```

### Step 2: Create the Weaverse directory structure

Create a `weaverse` directory in your app folder with the necessary files:

```bash
mkdir -p app/weaverse
touch app/weaverse/components.ts
touch app/weaverse/index.tsx
touch app/weaverse/schema.server.ts
touch app/weaverse/style.tsx
touch app/weaverse/csp.ts
```

### Step 3: Update the app root component to use Weaverse

Integrate Weaverse into your Hydrogen app by updating the root component.

#### File: /app/root.tsx

```diff
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useRouteError,
  useRouteLoaderData,
} from "@remix-run/react";
import type { SeoConfig } from "@shopify/hydrogen";
import { Analytics, getSeoMeta, useNonce } from "@shopify/hydrogen";
import type {
  LinksFunction,
  LoaderFunctionArgs,
  MetaArgs,
} from "@shopify/remix-oxygen";
import { useThemeSettings, withWeaverse } from "@weaverse/hydrogen";
import type { CSSProperties } from "react";
import { GlobalStyle } from "./weaverse/style";

export type RootLoader = typeof loader;

export let links: LinksFunction = () => {
  // Links configuration
};

export async function loader(args: LoaderFunctionArgs) {
  // Loader implementation
  // Note: Weaverse client is initialized in the server.ts file
}

export let meta = ({ data }: MetaArgs<typeof loader>) => {
  return getSeoMeta(data?.seo as SeoConfig);
};

function App() {
  return <Outlet />;
}

export function Layout({ children }: { children: React.ReactNode }) {
  let nonce = useNonce();
  let data = useRouteLoaderData<RootLoader>("root");
  let locale = data?.selectedLocale ?? DEFAULT_LOCALE;
  let { topbarHeight, topbarText } = useThemeSettings();

  return (
    <html lang={locale.language}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        {/* Stylesheets */}
        <Meta />
        <Links />
        <GlobalStyle />
      </head>
      <body
        style={
          {
            opacity: 0,
            "--initial-topbar-height": `${topbarText ? topbarHeight : 0}px`,
          } as CSSProperties
        }
        className="transition-opacity opacity-100! duration-300 antialiased bg-background text-body"
      >
        {data ? (
          <Analytics.Provider
            cart={data.cart}
            shop={data.shop}
            consent={data.consent}
          >
            {/* Layout components */}
            <main id="mainContent" className="grow">
              {children}
            </main>
            {/* Footer components */}
          </Analytics.Provider>
        ) : (
          children
        )}
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

export default withWeaverse(App);
```

Key aspects of this integration:

1. **withWeaverse HOC**: Wrap your App component with `withWeaverse` to enable Weaverse functionality.

2. **useThemeSettings Hook**: Access theme settings configured in the Weaverse editor.

3. **GlobalStyle Component**: Apply theme settings as global CSS variables.

4. **CSS Custom Properties**: Use theme settings for dynamic styling (like `--initial-topbar-height`).

The `withWeaverse` higher-order component connects your app to the Weaverse system, providing access to theme data and enabling visual editing capabilities. The `useThemeSettings` hook gives you access to all the theme settings defined in your schema.

Note that the Weaverse client is initialized in the server.ts file as shown in Step 4.

### Step 4: Update the server.ts file to include Weaverse

Add Weaverse server-side functionality to your Hydrogen app.

#### File: /server.ts

```diff
// Import statements
import { WeaverseClient } from "@weaverse/hydrogen";
import { components } from "~/weaverse/components";
import { themeSchema } from "~/weaverse/schema.server";

// Other imports and setup

export async function createAppLoadContext(
  request: Request,
  env: Env,
  executionContext: ExecutionContext
) {
  // Cache and session setup
  let waitUntil = executionContext.waitUntil.bind(executionContext);
  let [cache, session] = await Promise.all([
    caches.open("hydrogen"),
    AppSession.init(request, [env.SESSION_SECRET]),
  ]);

  let hydrogenContext = createHydrogenContext({
    env,
    request,
    cache,
    waitUntil,
    session,
    i18n: getLocaleFromRequest(request),
    cart: { queryFragment: CART_QUERY_FRAGMENT },
  });

  return {
    ...hydrogenContext,
    weaverse: new WeaverseClient({
      ...hydrogenContext,
      request,
      cache,
      themeSchema,
      components,
    }),
  };
}
```

### Step 5: Create content security policy configuration

Create a CSP configuration file to ensure your store works correctly with Weaverse.

#### File: /app/weaverse/csp.ts

```ts
import type { AppLoadContext } from "@shopify/remix-oxygen";
import { UNSAFE_CSP } from "@weaverse/hydrogen";

export function getWeaverseCsp(request: Request, context: AppLoadContext) {
  const { env } = context;
  const host = env?.WEAVERSE_HOST || "https://studio.weaverse.io";
  const cspObject = UNSAFE_CSP;

  // Add Weaverse Studio host to the connect-src
  cspObject.directives.connectSrc = [...cspObject.directives.connectSrc, host];

  // You can add other CSP directives as needed
  // For example, if you're using Google Fonts:
  // cspObject.directives.fontSrc = [...cspObject.directives.fontSrc, 'fonts.gstatic.com'];
  
  return cspObject;
}
```

### Step 6: Configure your environment variables

Add the necessary environment variables to connect your Hydrogen app with Weaverse.

#### File: /.env

```bash
# Core Hydrogen configuration
SESSION_SECRET="your-session-secret"
PUBLIC_STORE_DOMAIN="your-store.myshopify.com"
PUBLIC_STOREFRONT_API_TOKEN="your-storefront-api-token"

# Weaverse configuration
WEAVERSE_PROJECT_ID="your-weaverse-project-id"
WEAVERSE_HOST="https://studio.weaverse.io"
# WEAVERSE_API_KEY="optional-api-key-for-enhanced-features"

# Other environment variables...
```

## Best Practices

### Component Structure

1. **File Organization**: Organize your components in a clear structure:
   ```
   /app
     /components        # Small, reusable components
     /sections          # Full-width, page-building sections
     /weaverse          # Weaverse configuration and integration
   ```

2. **Component Exports**: Each component should export:
   - A default component (can use forwardRef for better integration)
   - A `schema` object created with `createSchema()` that defines the component's properties and UI controls

3. **Children Components**: For complex sections, create nested component structures:
   ```
   /sections
     /featured-products
       index.tsx        # Main section component
       product-items.tsx # Child component for product items
   ```

### Schema Design

1. **Comprehensive Controls**: Design your schema with intuitive controls:
   ```typescript
   export let schema = createSchema({
     // ... other properties
     settings: [
       {
         group: "Content",
         inputs: [
           {
             type: "text",
             name: "heading",
             label: "Heading",
             defaultValue: "Featured Products",
           },
           // Other controls
         ],
       },
       {
         group: "Style",
         inputs: [
           // Style controls
         ],
       },
     ],
   });
   ```

2. **Presets**: Provide default configurations to make components usable out of the box.

3. **Conditional Controls**: Use the `condition` property to show/hide controls based on other settings.

### Theme Schema

1. **Global Settings**: Use the theme schema to define global settings:
   - Typography (fonts, sizes, weights)
   - Colors (primary, secondary, background)
   - Spacing and layout defaults

2. **Structured Groups**: Organize settings in logical groups for better UX in the Weaverse builder.

3. **Defaults**: Always provide sensible default values for all settings.

### Data Fetching

For components that need to fetch data, use the component loader pattern:

```typescript
export let loader = async ({ weaverse, data }: ComponentLoaderArgs<MyComponentProps>) => {
  const { storefront } = weaverse;
  const { productHandle } = data;
  
  if (!productHandle) return null;
  
  return await storefront.query(PRODUCT_QUERY, {
    variables: { handle: productHandle },
    cache: storefront.CacheLong(),
  });
};
```

Use the `shouldRevalidate: true` property on inputs to automatically refresh data when settings change:

```typescript
{
  type: "select",
  name: "sortOrder",
  label: "Sort By",
  defaultValue: "best-selling",
  shouldRevalidate: true, // This will trigger the loader when changed
  configs: {
    options: [
      { value: "best-selling", label: "Best Selling" },
      { value: "newest", label: "Newest" },
      // Other options...
    ]
  }
}
```

### Responsive Design

Ensure your components work well on all devices by providing different settings for various screen sizes:

```typescript
{
  type: "range",
  name: "columnsDesktop",
  label: "Columns (desktop)",
  defaultValue: 4,
  configs: {
    min: 1,
    max: 6,
  },
},
{
  type: "range",
  name: "columnsTablet",
  label: "Columns (tablet)",
  defaultValue: 2,
  configs: {
    min: 1,
    max: 4,
  },
},
{
  type: "range",
  name: "columnsMobile",
  label: "Columns (mobile)",
  defaultValue: 1,
  configs: {
    min: 1,
    max: 2,
  },
},
```

### Error Handling

Always implement proper error handling in your components, especially for data fetching:

```tsx
if (!loaderData || !loaderData.collection) {
  return (
    <div ref={ref} className="text-center py-10">
      <p>No collection selected or collection not found.</p>
    </div>
  );
}
```

## Further Resources

- [Weaverse Documentation](mdc:workspace/workspace/workspace/workspace/workspace/workspace/https:/weaverse.io/docs)
- [Shopify Hydrogen Documentation](mdc:workspace/workspace/workspace/workspace/workspace/workspace/https:/shopify.dev/docs/custom-storefronts/hydrogen)
- [Weaverse Component Schema Guide](mdc:workspace/workspace/workspace/workspace/workspace/workspace/https:/weaverse.io/docs/guides/component-schema)
- [Data Fetching in Weaverse](mdc:workspace/workspace/workspace/workspace/workspace/workspace/https:/weaverse.io/docs/guides/section-data-fetching)
- [Weaverse Theme Settings](mdc:workspace/workspace/workspace/workspace/workspace/workspace/https:/weaverse.io/docs/guides/global-theme-settings)
</recipe_implementation>
