<h1 align="center">Pilot - Shopify Hydrogen Theme</h1>

<div align="center">
  <p style="text-align: center;">
    <img alt="Version" src="https://img.shields.io/badge/version-2.4.1-blue.svg?cacheSeconds=2592000" />
    <a href="#" target="_blank">
      <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg?label=license" />
    </a>
    <a href="https://twitter.com/weaverseio" target="_blank">
      <img alt="Twitter: weaverseio" src="https://img.shields.io/twitter/follow/weaverseio.svg?style=social&label=@weaverse.io" />
    </a>
  </p>

![Weaverse + Hydrogen + Shopify](https://cdn.shopify.com/s/files/1/0693/8201/3220/files/Logos.png?v=1695811776)

📚 [Read the docs](https://weaverse.io/docs) | 🗣 [Join our community on Slack](https://join.slack.com/t/weaversecommunity/shared_invite/zt-235bv7d80-velzJU8CpZIHWdrzFwAdXg) | 🐞 [Report a bug](https://github.com/weaverse/pilot/issues)

</div>

_Pilot is an innovative Shopify theme, powered by Hydrogen, Remix, and Weaverse, designed to create lightning-fast storefronts with exceptional performance. This theme combines a collection of powerful tools and features to streamline your Shopify development experience._

## Demo

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FWeaverse%2Fpilot&env=SESSION_SECRET,PUBLIC_STORE_DOMAIN,PUBLIC_STOREFRONT_API_TOKEN,WEAVERSE_PROJECT_ID&envDescription=SESSION_SECRET%2C%20PUBLIC_STORE_DOMAIN%2C%20PUBLIC_STOREFRONT_API_TOKEN%2C%20WEAVERSE_PROJECT_ID&envLink=https%3A%2F%2Fweaverse.io%2Fdocs%2Fguides%2F8460014-environment-variables&project-name=my-weaverse-hydrogen-project&repository-name=my-weaverse-hydrogen-project&demo-title=Weaverse%20Hydrogen%20Demo&demo-description=A%20Shopify%20Hydrogen%20storefront%20build%20with%20Weaverse&demo-url=https%3A%2F%2Fpilot.weaverse.dev&demo-image=https%3A%2F%2Fcdn.shopify.com%2Fs%2Ffiles%2F1%2F0728%2F0410%2F6547%2Ffiles%2FHome.png)

- [Live store](https://pilot.weaverse.dev)
- Try customizing Pilot on [Weaverse Playground](https://playground.weaverse.io)
  ![demo](https://cdn.shopify.com/s/files/1/0693/8201/3220/files/Home.png?v=1695816170)

## What's included

- Remix
- Hydrogen
- Oxygen
- Shopify CLI
- ESLint
- Prettier
- GraphQL generator
- TypeScript and JavaScript flavors
- Tailwind CSS (via PostCSS)
- Full-featured setup of components and routes
- Fully customizable inside [Weaverse](https://weaverse.io)

## Getting started

Follow these steps to get started with Pilot and begin crafting your Hydrogen-driven storefront:

1. Install [Weaverse Hydrogen Customizer](https://apps.shopify.com/weaverse) from Shopify App Store.
2. Create new Hydrogen storefront inside Weaverse.
3. Initialize the project and start a local dev server with `@weaverse/cli` tool as instructed in the Weaverse editor.
   ![Init Weaverse Storefront](https://cdn.shopify.com/s/files/1/0838/0052/3057/files/New_storefront.png?v=1699244454)
4. Open the Weaverse editor to start customizing and tailoring your storefront according to your preferences.

## Features overview

### Fetching page data inside route's loader

Fetching page data inside route's loader is a common pattern in **Hydrogen**. **Weaverse** provides a convenient way to do that by using `context.weaverse.loadPage` function.

```ts:routes/($locale)/_index.tsx
import {defer} from '@shopify/remix-oxygen';
import {type RouteLoaderArgs} from '@weaverse/hydrogen';

export async function loader(args: RouteLoaderArgs) {
  let {params, context} = args;

  return defer({
    weaverseData: await context.weaverse.loadPage(),
    // More route's loader data...
  });
}
```

`weaverse` is an `WeaverseClient` instance that has been injected into the app context by Weaverse. It provides a set of methods to interact with the Weaverse API.

```ts:server.ts
let handleRequest = createRequestHandler({
  build: remixBuild,
  mode: process.env.NODE_ENV,
  getLoadContext: () => ({
    // App context props
    weaverse: createWeaverseClient({
      storefront,
      request,
      env,
      cache,
      waitUntil,
    }),
  }),
});
```

### Rendering page content

Weaverse pages is rendered using `<WeaverseContent />` component.

```tsx:app/weaverse/index.tsx
import {WeaverseHydrogenRoot} from '@weaverse/hydrogen';
import {GenericError} from '~/components/GenericError';
import {components} from './components';

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

```tsx:app/weaverse/components/Logo.tsx
import {useThemeSettings} from '@weaverse/hydrogen';

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
import {withWeaverse} from '@weaverse/hydrogen';

function App() {
  return (
    <html lang={locale.language}>
      // App markup
    </html>
  );
}

export default withWeaverse(App);
```

### Create a section

To create a section, you need to create a new file in [`app/sections`](app/sections) directory and register it in [`app/weaverse/components.ts`](app/weaverse/components.ts) file.

```tsx:app/weaverse/sections/Video.tsx
import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import {forwardRef} from 'react';

interface VideoProps extends HydrogenComponentProps {
  heading: string;
  description: string;
  videoUrl: string;
}

let Video = forwardRef<HTMLElement, VideoProps>((props, ref) => {
  let {heading, description, videoUrl, ...rest} = props;
  return (
    <section ref={ref} {...rest}>
      <div className="py-8 px-4 mx-auto max-w-screen-xl lg:px-12 sm:text-center lg:py-16">
        <h2 className="mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white">
          {heading}
        </h2>
        <p className="font-light text-gray-500 sm:text-lg md:px-20 lg:px-38 xl:px-48 dark:text-gray-400">
          {description}
        </p>
        <iframe
          className="mx-auto mt-8 w-full max-w-2xl h-64 rounded-lg lg:mt-12 sm:h-96"
          src={videoUrl}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </section>
  );
});

export default Video;
```

Export a `schema` object from the file to define the component's schema with default data and settings to be used in the Weaverse editor.

```tsx:app/weaverse/sections/Video.tsx
export let schema: HydrogenComponentSchema = {
  type: 'video',
  title: 'Video',
  toolbar: ['general-settings', ['duplicate', 'delete']],
  inspector: [
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
};
```

What if your component needs to fetch data from Shopify API or any third-party API?

**Weaverse** provide a powerful `loader` function to fetch data from _any_ API, and it's run on the **server-side** 🤯😎.

Just export a `loader` function from your component:

```tsx:app/weaverse/sections/Video.tsx
import type {ComponentLoaderArgs} from '@weaverse/hydrogen';

export let loader = async ({context, itemData}: ComponentLoaderArgs) => {
  let {data} = await context.storefront.query<SeoCollectionContentQuery>(
    HOMEPAGE_SEO_QUERY,
    {
      variables: {handle: itemData.data.collectionHandle || 'frontpage'},
    },
  );
  return data;
};
```

And then you can use the data in your component with `Component.props.loaderData` 🤗

### Customizing the theme inside Weaverse Editor

Weaverse provides a convenient way to customize your theme inside the **Weaverse editor**. You can add new sections, customize existing ones, and change the theme settings.

![Weaverse Editor](https://cdn.shopify.com/s/files/1/0838/0052/3057/files/playground.jpg?v=1699244445)

### Local development inspects

- Hydrogen app: http://localhost:3456
- GraphiQL API browser: http://localhost:3456/graphiql
- Server side network requests: http://localhost:3456/debug-network

## References

- [Weaverse docs](https://weaverse.io/docs)
- [Hydrogen docs](https://shopify.dev/custom-storefronts/hydrogen)
- [Remix.run](https://remix.run/)

## License

This project is provided under the [MIT License](LICENSE).

---

Let **Weaverse** & **Pilot** empower your Shopify store with top-notch performance and unmatched customization possibilities! 🚀
