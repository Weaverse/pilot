import type { InspectorGroup } from "@weaverse/hydrogen";

export const searchSettings: InspectorGroup = {
  group: "Search",
  inputs: [
    {
      type: "textarea",
      name: "popularSearchKeywords",
      label: "Popular search keywords",
      defaultValue: "sunglasses, hats, jackets, shoes",
      placeholder: "sunglasses, hats, jackets, shoes",
      helpText:
        "Enter popular search keywords separated by commas. E.g. <strong>sunglasses, hats, jackets, shoes</strong>",
    },
  ],
};
