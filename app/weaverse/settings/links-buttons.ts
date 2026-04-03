import type { InspectorGroup } from "@weaverse/hydrogen";

export const linksButtonsSettings = {
  group: "Links & buttons",
  inputs: [
    {
      type: "heading",
      label: "Button (primary)",
    },
    {
      type: "color",
      label: "Background color",
      name: "buttonPrimaryBg",
      defaultValue: "#000000",
    },
    {
      type: "color",
      label: "Text color",
      name: "buttonPrimaryColor",
      defaultValue: "#ffffff",
    },
    {
      type: "heading",
      label: "Button (secondary)",
    },
    {
      type: "color",
      label: "Background color",
      name: "buttonSecondaryBg",
      defaultValue: "#ffffff",
    },
    {
      type: "color",
      label: "Text color",
      name: "buttonSecondaryColor",
      defaultValue: "#000000",
    },
    {
      type: "heading",
      label: "Button (outline)",
    },
    {
      type: "color",
      label: "Text and border",
      name: "buttonOutlineTextAndBorder",
      defaultValue: "#000000",
    },
  ],
} as const satisfies InspectorGroup;
