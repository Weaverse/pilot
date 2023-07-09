import type {HydrogenComponent, HydrogenThemeSchema} from '@weaverse/hydrogen';
import * as featuredCollections from '~/sections/featured-collections';
import * as featuredProducts from '~/sections/featured-products';
import * as hero from '~/sections/hero';
import * as main from '~/sections/main';

export let components: HydrogenComponent[] = [
  main,
  hero,
  featuredProducts,
  featuredCollections,
];

export let themeSchema: HydrogenThemeSchema = {
  info: {
    name: 'Pilot',
    version: '1.0.0',
    author: 'Weaverse',
    documentationUrl: 'https://help.weaverse.io/',
    supportUrl: 'https://help.weaverse.io/',
  },
  inspector: [
    {
      group: 'Weaverse',
      inputs: [
        {
          name: 'primaryColor',
          type: 'color',
          label: 'Primary Color',
          defaultValue: '#000000',
        },
      ],
    },
  ],
};
