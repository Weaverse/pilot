import typographyPlugin from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      padding: {
        DEFAULT: "20px",
        lg: "2rem",
      },
    },
    extend: {
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-down-and-fade": {
          from: { opacity: "0", transform: "translateY(-6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-left-and-fade": {
          from: { opacity: "0", transform: "translateX(6px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "slide-up-and-fade": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-right-and-fade": {
          from: { opacity: "0", transform: "translateX(-6px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-100%)" },
        },
        underline: {
          "0%": {
            transform: "scaleX(1)",
            transformOrigin: "right",
          },
          "50%": {
            transform: "scaleX(0)",
            transformOrigin: "right",
          },
          "51%": {
            transformOrigin: "left",
          },
          "100%": {
            transform: "scaleX(1)",
          },
        },
      },
      animation: {
        spin: "spin .5s linear infinite",
        marquee: "marquee var(--animation-speed, 150ms) linear infinite",
        underline: "underline 400ms linear",
        "fade-in": "fade-in 500ms ease-in forwards",
        "slide-down-and-fade":
          "slide-down-and-fade 400ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-left-and-fade":
          "slide-left-and-fade 400ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-up-and-fade":
          "slide-up-and-fade 400ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-right-and-fade":
          "slide-right-and-fade 400ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
      borderWidth: {
        6: "6px",
      },
      colors: {
        body: "rgb(var(--color-text) / <alpha-value>)",
        background: "rgb(var(--color-background) / <alpha-value>)",
        foreground: "rgb(var(--color-foreground) / <alpha-value>)",
        line: "rgb(var(--color-line) / <alpha-value>)",
      },
      outlineOffset: {
        3: "3px",
      },
      screens: {
        sm: "32em",
        md: "48em",
        lg: "64em",
        xl: "80em",
        "2xl": "96em",
        "sm-max": { max: "48em" },
        "sm-only": { min: "32em", max: "48em" },
        "md-only": { min: "48em", max: "64em" },
        "lg-only": { min: "64em", max: "80em" },
        "xl-only": { min: "80em", max: "96em" },
        "2xl-only": { min: "96em" },
      },
      spacing: {
        nav: "var(--height-nav)",
        screen: "var(--screen-height, 100vh)",
      },
      height: {
        screen: "var(--screen-height, 100vh)",
        "screen-no-nav":
          "calc(var(--screen-height, 100vh) - var(--height-nav))",
        "screen-dynamic": "var(--screen-height-dynamic, 100vh)",
      },
      width: {
        mobileGallery: "calc(100vw - 3rem)",
        page: "var(--page-width, 1280px)",
      },
      maxWidth: {
        page: "var(--page-width, 1280px)",
        "prose-narrow": "45ch",
        "prose-wide": "80ch",
      },
      fontFamily: {
        sans: ["Poppins", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["Arial", '"IBMPlexSerif"', "Palatino", "ui-serif"],
      },
      fontSize: {
        scale: [
          "calc(var(--min-size-px) + (var(--max-size) - var(--min-size)) * ((100vw - var(--wv-min-viewport-size, 320) * 1px) / (var(--wv-max-viewport-size, 1920) - var(--wv-min-viewport-size, 320))))",
          1,
        ],
        xs: ["calc(var(--body-base-size) * 0.75)", 1],
        sm: ["calc(var(--body-base-size) * 0.875)", 1.25],
        base: ["var(--body-base-size)", "var(--body-base-line-height)"],
        lg: ["calc(var(--body-base-size) * 1.125)", 1.75],
        xl: ["calc(var(--body-base-size) * 1.25)", 1.75],
        "2xl": ["calc(var(--body-base-size) * 1.5)", 2],
        "3xl": ["calc(var(--body-base-size) * 1.875)", 2.25],
        "4xl": ["calc(var(--body-base-size) * 2.25)", 2.5],
        "5xl": ["calc(var(--body-base-size) * 3)", 1],
        "6xl": ["calc(var(--body-base-size) * 3.75)", 1],
        "7xl": ["calc(var(--body-base-size) * 4.5)", 1],
        "8xl": ["calc(var(--body-base-size) * 6)", 1],
        "9xl": ["calc(var(--body-base-size) * 8)", 1],
      },
      lineHeight: {
        normal: "var(--body-base-line-height)",
      },
      letterSpacing: {
        normal: "var(--body-base-letter-spacing)",
      },
      boxShadow: {
        border: "inset 0px 0px 0px 1px rgb(var(--color-border) / 0.08)",
        header: "0 2px 5px #0000000f",
      },
      zIndex: {
        1: "1",
      },
      transitionDuration: {
        400: "400ms",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms")({ strategy: "class" }),
    typographyPlugin,
  ],
};
