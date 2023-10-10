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
      group: 'Colors',
      inputs: [
        {
          type: 'color',
          label: 'Background',
          name: 'colorBackground',
          defaultValue: '#FFF',
        },
        {
          type: 'color',
          label: 'Background subtle',
          name: 'colorBackgroundSubtle',
          defaultValue: '#0F0F0F08',
        },
        {
          type: 'color',
          label: 'Inverse background',
          name: 'colorInverseBackground',
          defaultValue: '#FFF',
        },
        {
          type: 'color',
          label: 'Text',
          name: 'colorText',
          defaultValue: '#0F0F0F',
        },
        {
          type: 'color',
          label: 'Text subtle',
          name: 'colorTextSubtle',
          defaultValue: '#0F0F0F80',
        },
        {
          type: 'color',
          label: 'Inverse text',
          name: 'colorInverseText',
          defaultValue: '#FFF',
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
          name: 'bodyBaseLineheight',
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
          name: 'headingBaseLineheight',
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
