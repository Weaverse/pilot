import type { InspectorGroup } from "@weaverse/hydrogen";

export const animationsSettings: InspectorGroup = {
  group: "Animations and effects",
  inputs: [
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
  ],
};
