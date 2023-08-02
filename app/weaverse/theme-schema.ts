import type {HydrogenThemeSchema} from '@weaverse/hydrogen';

export let themeSchema: HydrogenThemeSchema = {
  info: {
    name: 'Pilot',
    version: '1.0.0',
    author: 'Weaverse',
    authorProfilePhoto:
      'https://ucarecdn.com/174c3d08-fc53-4088-8d12-8eaf7090cdec/',
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
