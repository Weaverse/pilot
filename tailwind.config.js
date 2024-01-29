import typographyPlugin from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./app/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      opacity: {
        15: '0.15',
      },
      colors: {
        primary: 'rgb(var(--color-background) / <alpha-value>)', // background color
        contrast: 'rgb(var(--color-background) / <alpha-value>)', // temporary background color - replace primary after
        secondary: 'rgb(var(--color-inverse-background) / <alpha-value>)', // background inverse color
        body: 'rgb(var(--color-text) / <alpha-value>)', // body text color
        'inv-body': 'rgb(var(--color-inverse-text) / <alpha-value>)', // body text inverse color
        btn: 'rgb(var(--color-button) / <alpha-value>)', // button background color
        'btn-content': 'rgb(var(--color-button-text) / <alpha-value>)', // button text color
        'inv-btn': 'rgb(var(--color-inverse-button) / <alpha-value>)', // button inverse background color
        'inv-btn-content':
          'rgb(var(--color-inverse-button-text) / <alpha-value>)', // button inverse text color
        sale: 'rgb(var(--color-sale) / <alpha-value>)', // sale background color
        bar: 'rgb(var(--color-border) / <alpha-value>)', // border color
      },
      screens: {
        sm: '32em',
        md: '48em',
        lg: '64em',
        xl: '80em',
        '2xl': '96em',
        'sm-max': {max: '48em'},
        'sm-only': {min: '32em', max: '48em'},
        'md-only': {min: '48em', max: '64em'},
        'lg-only': {min: '64em', max: '80em'},
        'xl-only': {min: '80em', max: '96em'},
        '2xl-only': {min: '96em'},
      },
      spacing: {
        nav: 'var(--height-nav)',
        screen: 'var(--screen-height, 100vh)',
      },
      height: {
        screen: 'var(--screen-height, 100vh)',
        'screen-no-nav':
          'calc(var(--screen-height, 100vh) - var(--height-nav))',
        'screen-dynamic': 'var(--screen-height-dynamic, 100vh)',
      },
      width: {
        mobileGallery: 'calc(100vw - 3rem)',
      },
      fontFamily: {
        sans: ['Roboto', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['"IBMPlexSerif"', 'Palatino', 'ui-serif'],
      },
      fontSize: {
        scale: [
          'calc(var(--min-size-px) + (var(--max-size) - var(--min-size)) * ((100vw - var(--wv-min-viewport-size, 320) * 1px) / (var(--wv-max-viewport-size, 1920) - var(--wv-min-viewport-size, 320))))',
          1,
        ],
        xs: ['calc(var(--body-base-size) * 0.75)', 1],
        sm: ['calc(var(--body-base-size) * 0.875)', 1.25],
        base: ['var(--body-base-size)', 'var(--body-base-line-height)'],
        lg: ['calc(var(--body-base-size) * 1.125)', 1.75],
        xl: ['calc(var(--body-base-size) * 1.25)', 1.75],
        '2xl': ['calc(var(--body-base-size) * 1.5)', 2],
        '3xl': ['calc(var(--body-base-size) * 1.875)', 2.25],
        '4xl': ['calc(var(--body-base-size) * 2.25)', 2.5],
        '5xl': ['calc(var(--body-base-size) * 3)', 1],
        '6xl': ['calc(var(--body-base-size) * 3.75)', 1],
        '7xl': ['calc(var(--body-base-size) * 4.5)', 1],
        '8xl': ['calc(var(--body-base-size) * 6)', 1],
        '9xl': ['calc(var(--body-base-size) * 8)', 1],
      },
      lineHeight: {
        normal: 'var(--body-base-line-height)',
      },
      letterSpacing: {
        normal: 'var(--body-base-letter-spacing)',
      },
      maxWidth: {
        'prose-narrow': '45ch',
        'prose-wide': '80ch',
      },
      boxShadow: {
        border: 'inset 0px 0px 0px 1px rgb(var(--color-border) / 0.08)',
        header: 'inset 0px -1px 0px 0px rgba(21, 21, 21, 0.05)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
    typographyPlugin,
  ],
};
