import type {HydrogenComponent, HydrogenThemeSchema} from '@weaverse/hydrogen';

import {components as _components} from './components';
import {sections} from './sections';

export let components: Record<string, HydrogenComponent> = {
  ..._components,
  ...sections,
};

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
