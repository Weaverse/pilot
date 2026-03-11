import type { InspectorGroup } from "@weaverse/hydrogen";

export const announcementSettings: InspectorGroup = {
  group: "Scrolling announcements",
  inputs: [
    {
      type: "richtext",
      name: "topbarText",
      label: "Content",
      defaultValue: "",
    },
    {
      type: "range",
      label: "Content gap",
      name: "topbarScrollingGap",
      configs: {
        min: 0,
        max: 100,
        step: 1,
        unit: "px",
      },
      defaultValue: 44,
    },
    {
      type: "range",
      label: "Height",
      name: "topbarHeight",
      configs: {
        min: 10,
        max: 100,
        step: 1,
        unit: "px",
      },
      defaultValue: 36,
    },
    {
      type: "range",
      label: "Scrolling speed",
      name: "topbarScrollingSpeed",
      configs: {
        min: 1,
        max: 20,
        step: 1,
        unit: "x",
      },
      defaultValue: 1,
    },
  ],
};
