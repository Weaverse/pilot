import type { InspectorGroup } from "@weaverse/hydrogen";

export const layoutSettings: InspectorGroup = {
  group: "Layout",
  inputs: [
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
  ],
};
