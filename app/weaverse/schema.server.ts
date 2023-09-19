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
      group: 'Colors (light)',
      inputs: [
        {
          type: 'color',
          label: 'Primary',
          name: 'colorPrimary',
          defaultValue: '#141414',
        },
        {
          type: 'color',
          label: 'Contrast',
          name: 'colorContrast',
          defaultValue: '#FAFAF9',
        },
        {
          type: 'color',
          label: 'Accent',
          name: 'colorAccent',
          defaultValue: '#BF4800',
        },
      ],
    },
    {
      group: 'Colors (dark)',
      inputs: [
        {
          type: 'color',
          label: 'Primary',
          name: 'colorPrimaryDark',
          defaultValue: '#FAFAFA',
        },
        {
          type: 'color',
          label: 'Contrast',
          name: 'colorContrastDark',
          defaultValue: '#202124',
        },
        {
          type: 'color',
          label: 'Accent',
          name: 'colorAccentDark',
          defaultValue: '#EB5628',
        },
      ],
    },
    {
      group: 'Typography',
      inputs: [
        {
          type: 'range',
          label: 'Font size display (mobile)',
          name: 'fontSizeDisplayMobile',
          configs: {
            min: 1,
            max: 6,
            step: 0.25,
            unit: 'rem',
          },
          defaultValue: 3,
        },
        {
          type: 'range',
          label: 'Font size display (desktop)',
          name: 'fontSizeDisplayDesktop',
          configs: {
            min: 1,
            max: 6,
            step: 0.25,
            unit: 'rem',
          },
          defaultValue: 3.75,
        },
        {
          type: 'range',
          label: 'Font size heading (mobile)',
          name: 'fontSizeHeadingMobile',
          configs: {
            min: 1,
            max: 6,
            step: 0.25,
            unit: 'rem',
          },
          defaultValue: 2,
        },
        {
          type: 'range',
          label: 'Font size heading (desktop)',
          name: 'fontSizeHeadingDesktop',
          configs: {
            min: 1,
            max: 6,
            step: 0.25,
            unit: 'rem',
          },
          defaultValue: 2.25,
        },
        {
          type: 'range',
          label: 'Font size lead',
          name: 'fontSizeLead',
          configs: {
            min: 1,
            max: 4,
            step: 0.125,
            unit: 'rem',
          },
          defaultValue: 1.125,
        },
        {
          type: 'range',
          label: 'Font size copy',
          name: 'fontSizeCopy',
          configs: {
            min: 0.5,
            max: 2,
            step: 0.125,
            unit: 'rem',
          },
          defaultValue: 1,
        },
        {
          type: 'range',
          label: 'Font size fine',
          name: 'fontSizeFine',
          configs: {
            min: 0.25,
            max: 2,
            step: 0.125,
            unit: 'rem',
          },
          defaultValue: 0.75,
        },
      ],
    },
    {
      group: 'Layout',
      inputs: [
        {
          type: 'range',
          label: 'Nav height (mobile)',
          name: 'navHeightMobile',
          configs: {
            min: 2,
            max: 8,
            step: 1,
            unit: 'rem',
          },
          defaultValue: 3,
        },
        {
          type: 'range',
          label: 'Nav height (tablet)',
          name: 'navHeightTablet',
          configs: {
            min: 2,
            max: 8,
            step: 1,
            unit: 'rem',
          },
          defaultValue: 4,
        },
        {
          type: 'range',
          label: 'Nav height (desktop)',
          name: 'navHeightDesktop',
          configs: {
            min: 2,
            max: 8,
            step: 1,
            unit: 'rem',
          },
          defaultValue: 6,
        },
      ],
    },
  ],
};
