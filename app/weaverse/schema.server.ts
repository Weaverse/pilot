import type {HydrogenThemeSchema} from '@weaverse/hydrogen';
import pkg from '../../package.json';

export let themeSchema: HydrogenThemeSchema = {
  info: {
    version: pkg.version,
    author: 'Weaverse',
    name: 'Pilot',
    authorProfilePhoto:
      'https://ucarecdn.com/174c3d08-fc53-4088-8d12-8eaf7090cdec/',
    documentationUrl: 'https://weaverse.io/docs',
    supportUrl: 'https://help.weaverse.io/',
  },
  inspector: [
    {
      group: 'Logo',
      inputs: [
        {
          type: 'image',
          name: 'logoData',
          label: 'Logo',
          defaultValue: {
            id: 'gid://shopify/MediaImage/34144817938616',
            altText: '',
            url: 'https://cdn.shopify.com/s/files/1/0623/5095/0584/files/Pilot_logo_b04f1938-06e5-414d-8a47-d5fcca424000.png?v=1697101908',
            width: 320,
            height: 116,
          },
        },
      ],
    },
    {
      group: 'Colors',
      inputs: [
        {
          type: 'color',
          label: 'Background',
          name: 'colorBackground',
          defaultValue: '#ffffff',
        },
        {
          type: 'color',
          label: 'Inverse background',
          name: 'colorInverseBackground',
          defaultValue: '#0f0f0f',
        },
        {
          type: 'color',
          label: 'Text',
          name: 'colorText',
          defaultValue: '#0F0F0F',
        },
        {
          type: 'color',
          label: 'Inverse text',
          name: 'colorInverseText',
          defaultValue: '#ffffff',
        },
        {
          type: 'color',
          label: 'Button',
          name: 'colorButton',
          defaultValue: '#0F0F0F',
        },
        {
          type: 'color',
          label: 'Button text',
          name: 'colorButtonText',
          defaultValue: '#FFF',
        },
        {
          type: 'color',
          label: 'Inverse button',
          name: 'colorInverseButton',
          defaultValue: '#FFF',
        },
        {
          type: 'color',
          label: 'Inverse button text',
          name: 'colorInverseButtonText',
          defaultValue: '#0F0F0F',
        },
        {
          type: 'color',
          label: 'Sale',
          name: 'colorSale',
          defaultValue: '#DE4B4B',
        },
        {
          type: 'color',
          label: 'Border',
          name: 'colorBorder',
          defaultValue: '#0F0F0F',
        },
      ],
    },
    {
      group: 'Typography',
      inputs: [
        {
          type: 'range',
          label: 'Body base size',
          name: 'bodyBaseSize',
          configs: {
            min: 12,
            max: 48,
            step: 1,
            unit: 'px',
          },
          defaultValue: 18,
        },
        {
          type: 'range',
          label: 'Body base spacing',
          name: 'bodyBaseSpacing',
          configs: {
            min: 0,
            max: 2,
            step: 0.125,
            unit: 'rem',
          },
          defaultValue: 0.5,
        },
        {
          type: 'range',
          label: 'Body base line height',
          name: 'bodyBaseLineHeight',
          configs: {
            min: 1,
            max: 2,
            step: 0.125,
            unit: 'rem',
          },
          defaultValue: 1.5,
        },
        {
          type: 'range',
          label: 'Heading base size',
          name: 'headingBaseSize',
          configs: {
            min: 22,
            max: 60,
            step: 1,
            unit: 'px',
          },
          defaultValue: 38,
        },
        {
          type: 'range',
          label: 'Heading base spacing',
          name: 'headingBaseSpacing',
          configs: {
            min: 0,
            max: 2,
            step: 0.125,
            unit: 'rem',
          },
          defaultValue: 0.5,
        },
        {
          type: 'range',
          label: 'Heading base line height',
          name: 'headingBaseLineHeight',
          configs: {
            min: 1,
            max: 2,
            step: 0.125,
            unit: 'rem',
          },
          defaultValue: 1.5,
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
