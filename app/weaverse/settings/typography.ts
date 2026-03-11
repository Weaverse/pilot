import type { InspectorGroup } from "@weaverse/hydrogen";

export const typographySettings: InspectorGroup = {
  group: "Typography",
  inputs: [
    {
      type: "heading",
      label: "Headings",
    },
    {
      type: "select",
      label: "Letter spacing",
      name: "headingBaseSpacing",
      configs: {
        options: [
          { label: "-75", value: "-0.075em" },
          { label: "-50", value: "-0.05em" },
          { label: "-25", value: "-0.025em" },
          { label: "0", value: "0em" },
          { label: "25", value: "0.025em" },
          { label: "50", value: "0.05em" },
          { label: "75", value: "0.075em" },
          { label: "100", value: "0.1em" },
          { label: "150", value: "0.15em" },
          { label: "200", value: "0.2em" },
          { label: "250", value: "0.25em" },
        ],
      },
      defaultValue: "0.025em",
    },
    {
      type: "range",
      label: "Font size",
      name: "h1BaseSize",
      configs: {
        min: 48,
        max: 92,
        step: 1,
        unit: "px",
      },
      defaultValue: 60,
    },
    {
      type: "range",
      label: "Line height",
      name: "headingBaseLineHeight",
      configs: {
        min: 0.8,
        max: 2,
        step: 0.1,
      },
      defaultValue: 1.2,
    },
    {
      type: "heading",
      label: "Body text",
    },
    {
      type: "select",
      label: "Letter spacing",
      name: "bodyBaseSpacing",
      configs: {
        options: [
          { label: "-75", value: "-0.075em" },
          { label: "-50", value: "-0.05em" },
          { label: "-25", value: "-0.025em" },
          { label: "0", value: "0em" },
          { label: "25", value: "0.025em" },
          { label: "50", value: "0.05em" },
          { label: "75", value: "0.075em" },
          { label: "100", value: "0.1em" },
          { label: "150", value: "0.15em" },
          { label: "200", value: "0.2em" },
          { label: "250", value: "0.25em" },
        ],
      },
      defaultValue: "0.025em",
    },
    {
      type: "range",
      label: "Font size",
      name: "bodyBaseSize",
      configs: {
        min: 12,
        max: 48,
        step: 1,
        unit: "px",
      },
      defaultValue: 16,
    },
    {
      type: "range",
      label: "Line height",
      name: "bodyBaseLineHeight",
      configs: {
        min: 0.8,
        max: 2,
        step: 0.1,
      },
      defaultValue: 1.5,
    },
  ],
};
