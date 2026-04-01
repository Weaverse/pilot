import type { InspectorGroup } from "@weaverse/hydrogen";

export const borderRadiusSettings: InspectorGroup = {
  group: "Border radius",
  inputs: [
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
  ],
};
