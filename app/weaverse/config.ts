import type {HydrogenComponent, HydrogenThemeSchema} from '@weaverse/hydrogen';
import * as main from './sections/main';
import * as featuredProducts from './sections/featured-products';
import * as hero from './sections/hero';

export let components: HydrogenComponent[] = [main, hero, featuredProducts];

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
