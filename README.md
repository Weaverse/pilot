<h1 align="center">Pilot - Production-ready Shopify Hydrogen Theme</h1>

<div align="center">

📚 [Read the docs](https://weaverse.io/docs) | 🗣 [Join our community on Slack](https://join.slack.com/t/weaversecommunity/shared_invite/zt-235bv7d80-velzJU8CpZIHWdrzFwAdXg) | 🐞 [Report a bug](https://github.com/weaverse/pilot/issues)

</div>

![Weaverse + Hydrogen + Shopify](https://cdn.shopify.com/s/files/1/0838/0052/3057/files/weaverse-x-hydrogen-x-shopify.png?v=1755245801)

_Pilot is an innovative Shopify theme, powered by Hydrogen, React Router 7, and Weaverse, designed to create lightning-fast storefronts with exceptional performance. This theme combines a collection of powerful tools and features to streamline your Shopify development experience._

## Who is using Weaverse/Pilot on production?
These **Shopify (Plus)** brands built on top of Weaverse/Pilot:
- [Huckleberry Roasters](https://www.huckleberryroasters.com/) - Crafting coffee in Colorado since 2011, Huckleberry Roasters delivers award-winning flavors with ethically sourced beans.
- [Bubble Goods](https://bubblegoods.com/) - 2,000+ healthy food products shipped from small independent U.S. makers to your door.
- [Karma and Luck](https://www.karmaandluck.com) - modern lifestyle brand rooted in timeless traditions and spiritual intention.
- [Baltzar](https://baltzar.com/) - curated selection of menswear brands from world renowned specialists such as Frank Clegg, Albert Thurston and Astorflex.
- [iROCKER](https://irockersup.com/) - provide life on the water to all, with gear that goes the extra mile.
- [Roland (Brazil)](https://store.roland.com.br/) - electronic musical instruments, drums, digital pianos, synthesizers, and dance/DJ gears.
- [Timothy London](https://timothy.london/) - British brand of premium travel goods and accessories.
- [Vasuma Eyewear](https://vasuma.com/) - Vasuma creates eyewear for both men and women. From Stockholm, Sweden our eyewear are inspired by the best of the vintage eras of the 50s and 60s.
- And many more...

## Links

- Live store: https://pilot.weaverse.dev
- Customizing Pilot on Weaverse Studio: https://studio.weaverse.io/demo?theme=pilot
  ![pilot.weaverse.dev](https://cdn.shopify.com/s/files/1/0838/0052/3057/files/pilot.weavverse.dev_0b0b2f77-b79e-4524-8cf5-bc22d6ec4ba9.png?v=1744963684)

## What's included

- Shopify Hydrogen / Oxygen / CLI
- Shopify Basic/Plus features support:
  - New [Shopify Customer Account API](https://www.shopify.com/partners/blog/introducing-customer-account-api-for-headless-stores) (OAuth-based)
  - [Combined Listings](https://shopify.dev/docs/apps/build/product-merchandising/combined-listings)
  - [Product bundles](https://help.shopify.com/en/manual/products/bundles)
- [React Router 7](https://reactrouter.com/) for routing/SSR/data loading
- [Biome](https://biomejs.dev/) code linter/formatter
- TypeScript with strict configuration
- GraphQL code generator
- Styled with [TailwindCSS](https://tailwindcss.com/) (v4)
- [Radix-UI](https://www.radix-ui.com/) for accessible/reusable UI components
- [class-variance-authority](https://cva.style/) (cva) for component variants
- [Swiper](https://swiperjs.com/) for carousels/sliders
- [Framer Motion](https://www.framer.com/motion/) for animations
- [Judge.me](https://judge.me/) reviews integration
- [Klaviyo](https://www.klaviyo.com/) integration for email marketing
- Full-featured setup of components and routes
- Fully customizable inside [Weaverse Studio](https://weaverse.io)

## Deployment

- [Deploy to Shopify Oxygen](https://weaverse.io/docs/deployment/oxygen)
- [Deploy to Vercel](https://wvse.cc/deploy-pilot-to-vercel)

## Getting started

**Requirements:**

- Node.js version 20.0.0 or higher
- `npm` or `pnpm` package manager

**Follow these steps to get started with Pilot and begin crafting your Hydrogen-driven storefront:**

1. Install [Weaverse Hydrogen Customizer](https://apps.shopify.com/weaverse) from Shopify App Store.
2. Create new Hydrogen storefront inside Weaverse.
3. Initialize the project and start a local dev server with `@weaverse/cli` tool as instructed in the Weaverse Studio.
   ![Create new Weaverse Shopify Hydrogen project](https://cdn.shopify.com/s/files/1/0838/0052/3057/files/new_hydrogen_project.png?v=1735008500)
4. Open **Weaverse Studio** to start customizing and tailoring your storefront according to your preferences.

## Quick Start Commands

```bash
# Install dependencies
npm install

# Start development server on port 3456
npm run dev

# Run code quality checks before committing
npm run biome:fix
npm run typecheck

# Build for production
npm run build

# Run E2E tests
npm run e2e
```

## Features overview

### Fetching page data with parallel loading

Pilot uses parallel data loading for optimal performance. Every route loads Weaverse data alongside GraphQL queries using `Promise.all()`:

```ts:routes/($locale)._index.tsx
import { data } from '@shopify/remix-oxygen';
import { type LoaderFunctionArgs } from '@shopify/remix-oxygen';

export async function loader({ context }: LoaderFunctionArgs) {
  const { storefront, weaverse } = context;

  // Parallel data loading for best performance
  const [collections, weaverseData] = await Promise.all([
    storefront.query(COLLECTIONS_QUERY),
    weaverse.loadPage({ type: 'INDEX' }),
  ]);

  return data({
    collections,
    weaverseData,
  });
}
```

`weaverse` is an `WeaverseClient` instance that has been injected into the app context by Weaverse. It provides a set of methods to interact with the Weaverse API.

```ts:app/lib/context.ts
// app/lib/context.ts

const hydrogenContext = createHydrogenContext({
    env,
    request,
    cache,
    waitUntil,
    session,
    i18n: getLocaleFromRequest(request),
    cart: {
      queryFragment: CART_QUERY_FRAGMENT,
    },
  });

  return {
    ...hydrogenContext,
    // declare additional Remix loader context
    weaverse: new WeaverseClient({
      ...hydrogenContext,
      request,
      cache,
      themeSchema,
      components,
    }),
  };
```

### Rendering page content

Weaverse pages is rendered using `<WeaverseContent />` component.

```tsx:app/weaverse/index.tsx
import { WeaverseHydrogenRoot } from '@weaverse/hydrogen';
import { GenericError } from '~/components/generic-error';
import { components } from './components';

export function WeaverseContent() {
  return (
    <WeaverseHydrogenRoot
      components={components}
      errorComponent={GenericError}
    />
  );
}

```

And in your route:

```tsx:routes/($locale)/_index.tsx
export default function Homepage() {
  return <WeaverseContent />;
}
```

Dead simple, right?

### Global theme settings

Weaverse global theme settings is loaded in the `root`'s loader with `context.weaverse.loadThemeSettings` function.

```tsx:root.tsx
export async function loader({request, context}: RouteLoaderArgs) {
  return defer({
    // App data...
    weaverseTheme: await context.weaverse.loadThemeSettings(),
  });
}
```

And then you can use it in your components with `useThemeSettings` hook.

```tsx:app/weaverse/components/logo.tsx
import { useThemeSettings } from '@weaverse/hydrogen';

function Logo() {
  let {logo} = useThemeSettings();

  return (
    <div className="flex items-center">
      <img src={logo} alt="Logo" />
    </div>
  );
}
```

The `App` component is wrapped with `withWeaverse` HoC in order to SSR the theme settings.

```tsx:root.tsx
import { withWeaverse } from '@weaverse/hydrogen';

function App() {
  return (
    <html lang={locale.language}>
      // App markup
    </html>
  );
}

export default withWeaverse(App);
```

### Create a Weaverse section

To create a section, you need to create a new file in [`app/sections`](app/sections) directory and register it in [`app/weaverse/components.ts`](app/weaverse/components.ts) file.

**Important:** All Weaverse sections must include `ref` as a prop (or use `forwardRef` with React prior to v19) and extend `HydrogenComponentProps`.

```tsx:app/sections/video/index.tsx
import type { HydrogenComponentProps } from '@weaverse/hydrogen';

interface VideoProps extends HydrogenComponentProps {
  ref: React.Ref<HTMLElement>
  heading: string;
  description: string;
  videoUrl: string;
}

export default function Video(props: VideoProps) {
  const { ref, heading, description, videoUrl, ...rest } = props;
  return (
    <section ref={ref} {...rest}>
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-12 lg:py-16 sm:text-center">
        <h2 className="mb-4 text-4xl font-extrabold tracking-tight text-gray-900">
          {heading}
        </h2>
        <p className="font-light text-gray-500 sm:text-lg md:px-20 lg:px-38 xl:px-48">
          {description}
        </p>
        <iframe
          className="mx-auto mt-8 h-64 w-full max-w-2xl rounded-lg lg:mt-12 sm:h-96"
          src={videoUrl}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </section>
  );
});
```

Export a `schema` object from the file to define the component's schema with default data and settings to be used in the **Weaverse Studio**.

```tsx:app/sections/video/index.tsx (continued)
export const schema = createSchema({
  type: 'video',
  title: 'Video',
  settings: [
    {
      group: 'Video',
      inputs: [
        {
          type: 'text',
          name: 'heading',
          label: 'Heading',
          defaultValue: 'Learn More About Our Products',
          placeholder: 'Learn More About Our Products',
        },
        {
          type: 'textarea',
          name: 'description',
          label: 'Description',
          defaultValue: `Watch these short videos to see our products in action. Learn how to use them and what makes them special. See demos of our products being used in real-life situations. The videos provide extra details and showcase the full capabilities of what we offer. If you're interested in learning more before you buy, be sure to check out these informative product videos.`,
          placeholder: 'Video description',
        },
        {
          type: 'text',
          name: 'videoUrl',
          label: 'Video URL',
          defaultValue: 'https://www.youtube.com/embed/-akQyQN8rYM',
          placeholder: 'https://www.youtube.com/embed/-akQyQN8rYM',
        },
      ],
    },
  ],
});
```

What if your component needs to fetch data from Shopify API or any third-party API?

**Weaverse** provide a powerful `loader` function to fetch data from _any_ API, and it's run on the **server-side** 🤯😎.

Just export a `loader` function from your component:

```tsx:app/sections/video/index.tsx (loader example)
import type { ComponentLoaderArgs } from '@weaverse/hydrogen';

export const loader = async ({ weaverse, data }: ComponentLoaderArgs) => {
  const result = await weaverse.storefront.query<SeoCollectionContentQuery>(
    HOMEPAGE_SEO_QUERY,
    {
      variables: { handle: data.collection.handle || 'frontpage' },
    },
  );
  return result.data;
};
```

And then you can use the data in your component with `Component.props.loaderData` 🤗

Don't forget to register your new section in `app/weaverse/components.ts`:

```typescript
import * as Video from "~/sections/video";

export const components: HydrogenComponent[] = [
  // ... existing components
  Video,
];
```

### Manage content and style your pages within Weaverse Studio

Weaverse provides a convenient way to customize your theme inside the **Weaverse Studio**. You can add new sections, customize existing ones, and change the theme settings.

![Pilot in Weaverse Studio](https://cdn.shopify.com/s/files/1/0838/0052/3057/files/pilot-in-weaverse-studio.png?v=1755247352)

### Project Structure

```
app/
├── components/     # Reusable UI components
├── sections/       # Weaverse sections/components
├── routes/         # React Router routes (with locale prefix)
├── graphql/        # GraphQL queries and fragments
├── utils/          # Helper functions
└── weaverse/       # Weaverse configuration

Key configuration files:
- biome.json                  # Code formatting and linting
- codegen.ts                  # GraphQL code generation
- react-router.config.ts      # React Router configuration
- vite.config.ts              # Vite bundler configuration
```

### Development Tools

- **Development server**: http://localhost:3456
- **GraphiQL API browser**: http://localhost:3456/graphiql
- **Network inspector**: http://localhost:3456/debug-network
- **Weaverse Studio**: Access through your Shopify admin

## References

- [Weaverse docs](https://weaverse.io/docs)
- [Hydrogen docs](https://shopify.dev/custom-storefronts/hydrogen)
- [React Router](https://reactrouter.com/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Biome](https://biomejs.dev/)

## License

This project is provided under the [MIT License](LICENSE).

---

Let **Weaverse** & **Pilot** empower your Shopify store with top-notch performance and unmatched customization possibilities! 🚀
