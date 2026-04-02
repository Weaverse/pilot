import type { InspectorGroup } from "@weaverse/hydrogen";

export const generalSettings: InspectorGroup = {
  group: "General",
  inputs: [
    {
      type: "heading",
      label: "Layout",
    },
    {
      type: "range",
      label: "Page width",
      name: "pageWidth",
      configs: {
        min: 1000,
        max: 1600,
        step: 10,
        unit: "px",
      },
      defaultValue: 1280,
    },
    {
      type: "range",
      label: "Nav height (mobile)",
      name: "navHeightMobile",
      configs: {
        min: 2,
        max: 8,
        step: 1,
        unit: "rem",
      },
      defaultValue: 3,
    },
    {
      type: "range",
      label: "Nav height (tablet)",
      name: "navHeightTablet",
      configs: {
        min: 2,
        max: 8,
        step: 1,
        unit: "rem",
      },
      defaultValue: 4,
    },
    {
      type: "range",
      label: "Nav height (desktop)",
      name: "navHeightDesktop",
      configs: {
        min: 2,
        max: 8,
        step: 1,
        unit: "rem",
      },
      defaultValue: 6,
    },
    {
      type: "heading",
      label: "Border radius",
    },
    {
      type: "range",
      name: "radiusBase",
      label: "Base radius",
      configs: {
        min: 0,
        max: 40,
        step: 2,
        unit: "px",
      },
      defaultValue: 0,
      helpText:
        "Global border radius applied to buttons, inputs, cards, modals, and badges. Set to 0 for square corners.",
    },
    {
      type: "heading",
      label: "Animations and effects",
    },
    {
      type: "switch",
      label: "Enable view transition",
      name: "enableViewTransition",
      defaultValue: true,
      helpText:
        'Learn more about how <a href="https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API" target="_blank" rel="noreferrer">View Transitions API</a> work.',
    },
    {
      type: "switch",
      label: "Reveal elements on scroll",
      name: "revealElementsOnScroll",
      defaultValue: true,
    },
    {
      type: "heading",
      label: "Colors",
    },
    {
      type: "color",
      label: "Background",
      name: "colorBackground",
      defaultValue: "#ffffff",
    },
    {
      type: "color",
      label: "Text",
      name: "colorText",
      defaultValue: "#0F0F0F",
    },
    {
      type: "color",
      label: "Text (subtle)",
      name: "colorTextSubtle",
      defaultValue: "#88847F",
    },
    {
      type: "color",
      label: "Text (inverse)",
      name: "colorTextInverse",
      defaultValue: "#fff",
    },
    {
      type: "color",
      label: "Borders",
      name: "colorLine",
      defaultValue: "#3B352C",
    },
    {
      type: "color",
      label: "Borders (subtle)",
      name: "colorLineSubtle",
      defaultValue: "#A19B91",
    },
    {
      type: "heading",
      label: "Product colors",
    },
    {
      type: "color",
      label: "Compare price text",
      name: "comparePriceTextColor",
      defaultValue: "#84807B",
    },
    {
      type: "color",
      label: "Product reviews",
      name: "productReviewsColor",
      defaultValue: "#108474",
    },
  ],
};
