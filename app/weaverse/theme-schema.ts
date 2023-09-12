import type {HydrogenThemeSchema} from '@weaverse/hydrogen';

export let themeSchema: HydrogenThemeSchema = {
  info: {
    version: '2.2.0',
    author: 'Weaverse',
    name: 'Pilot',
    authorProfilePhoto:
      'https://ucarecdn.com/174c3d08-fc53-4088-8d12-8eaf7090cdec/',
    documentationUrl: 'https://weaverse.io/docs',
    supportUrl: 'https://help.weaverse.io/',
  },
  inspector: [
    {
      group: 'Colors',
      inputs: [
        {
          type: 'color',
          label: 'Primary',
          name: 'colorPrimary',
          defaultValue: 'rgb(20, 20, 20)',
        },
        {
          type: 'color',
          label: 'Contrast',
          name: 'colorContrast',
          defaultValue: 'rgb(250, 250, 249)',
        },
        {
          type: 'color',
          label: 'Accent',
          name: 'colorAccent',
          defaultValue: 'rgb(191, 72, 0)',
        },
        {
          type: 'color',
          label: 'Shop Pay',
          name: 'colorShopPay',
          defaultValue: '#5a31f4',
        },
      ],
    },
    {
      group: 'Typography',
      inputs: [
        {
          type: 'text',
          label: 'Font size display',
          name: 'fontSizeDisplay',
          defaultValue: '3rem',
        },
        {
          type: 'text',
          label: 'Font size heading',
          name: 'fontSizeHeading',
          defaultValue: '2rem',
        },
        {
          type: 'text',
          label: 'Font size lead',
          name: 'fontSizeLead',
          defaultValue: '1.125rem',
        },
        {
          type: 'text',
          label: 'Font size copy',
          name: 'fontSizeCopy',
          defaultValue: '1rem',
        },
        {
          type: 'text',
          label: 'Font size fine',
          name: 'fontSizeFine',
          defaultValue: '0.75rem',
        },
      ],
    },
    {
      group: 'Layout',
      inputs: [
        {
          type: 'text',
          label: 'Nav height',
          name: 'navHeight',
          defaultValue: '4rem',
        },
        {
          type: 'text',
          label: 'Screen height',
          name: 'screenHeight',
          defaultValue: '100vh',
        },
      ],
    },
  ],
};
