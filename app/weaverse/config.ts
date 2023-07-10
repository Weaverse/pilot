import type {HydrogenComponent, HydrogenThemeSchema} from '@weaverse/hydrogen';
import * as FeaturedCollections from '~/sections/featured-collections';
import * as FeaturedProducts from '~/sections/featured-products';
import * as Hero from '~/sections/hero';
import * as Testimonial from '~/sections/testimonial';
import * as TestimonialItem from '~/sections/testimonial/item';
import * as Main from '~/sections/main';

export let components: HydrogenComponent[] = [
  Main,
  Hero,
  FeaturedProducts,
  FeaturedCollections,
  Testimonial,
  TestimonialItem,
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
