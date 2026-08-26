import type { InspectorGroup } from "@weaverse/hydrogen";

export const announcementSettings = {
  group: "Scrolling announcements",
  inputs: [
    {
      // `name` is a key into `i18n.staticContent`, not a component prop: the
      // value is stored per language so each market gets its own copy.
      type: "translation-key",
      name: "announcement.topbarText",
      label: "Content",
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
    {
      type: "heading",
      label: "Colors",
    },
    {
      type: "color",
      label: "Text",
      name: "topbarTextColor",
      defaultValue: "#ffffff",
    },
    {
      type: "color",
      label: "Background",
      name: "topbarBgColor",
      defaultValue: "#f3f2f1",
    },
  ],
} as const satisfies InspectorGroup;
