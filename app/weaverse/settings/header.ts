import type { InspectorGroup } from "@weaverse/hydrogen";

export const headerSettings: InspectorGroup = {
  group: "Header",
  inputs: [
    {
      type: "select",
      name: "headerWidth",
      label: "Header width",
      configs: {
        options: [
          { value: "full", label: "Full page" },
          { value: "stretch", label: "Stretch" },
          { value: "fixed", label: "Fixed" },
        ],
      },
      defaultValue: "fixed",
    },
    {
      type: "switch",
      label: "Enable transparent header",
      name: "enableTransparentHeader",
      defaultValue: false,
      helpText: "Header is transparent in home page only.",
    },
    {
      type: "image",
      name: "logoData",
      label: "Logo",
      defaultValue: {
        id: "gid://shopify/MediaImage/34144817938616",
        altText: "Logo",
        url: "https://cdn.shopify.com/s/files/1/0623/5095/0584/files/Pilot_logo_b04f1938-06e5-414d-8a47-d5fcca424000.png?v=1697101908",
        width: 320,
        height: 116,
      },
    },
    {
      type: "image",
      name: "transparentLogoData",
      label: "Logo on transparent header",
      defaultValue: {
        id: "gid://shopify/MediaImage/34144817938616",
        altText: "Logo",
        url: "https://cdn.shopify.com/s/files/1/0838/0052/3057/files/transparent_Pilot_logo.png?v=1718763594",
        width: 320,
        height: 116,
      },
      condition: (theme) => theme.enableTransparentHeader === true,
    },
    {
      type: "range",
      name: "logoWidth",
      label: "Logo width",
      configs: {
        min: 50,
        max: 500,
        step: 1,
        unit: "px",
      },
      defaultValue: 150,
    },
    {
      type: "switch",
      label: "Show country selector",
      name: "showHeaderCountrySelector",
      defaultValue: false,
    },
    {
      type: "select",
      label: "Country name display",
      name: "countryNameDisplay",
      configs: {
        options: [
          { value: "short", label: "Short (e.g. US)" },
          { value: "full", label: "Full (e.g. United States)" },
        ],
      },
      defaultValue: "short",
      condition: (theme: { showHeaderCountrySelector: boolean }) =>
        theme.showHeaderCountrySelector,
    },
  ],
};
