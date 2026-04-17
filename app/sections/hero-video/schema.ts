import { createSchema } from "@weaverse/hydrogen";
import { overlayInputs } from "~/components/overlay";
import type { HeroVideoData } from "./index";

export const schema = createSchema({
  type: "hero-video",
  title: "Hero video",
  settings: [
    {
      group: "Video",
      inputs: [
        {
          type: "text",
          name: "videoURL",
          label: "Video URL",
          defaultValue: "https://www.youtube.com/watch?v=Su-x4Mo5xmU",
          placeholder: "https://www.youtube.com/watch?v=Su-x4Mo5xmU",
          helpText: "Support YouTube, Vimeo, MP4, WebM, and HLS streams.",
        },
        {
          type: "switch",
          name: "autoplay",
          label: "Autoplay",
          defaultValue: true,
        },
        {
          type: "switch",
          name: "loop",
          label: "Loop",
          defaultValue: true,
        },
        {
          type: "switch",
          name: "showPlayPauseButton",
          label: "Show play/pause button",
          defaultValue: true,
        },
        {
          type: "heading",
          label: "Layout",
        },
        {
          type: "select",
          name: "height",
          label: "Section height",
          configs: {
            options: [
              { value: "small", label: "Small" },
              { value: "medium", label: "Medium" },
              { value: "large", label: "Large" },
              { value: "custom", label: "Custom" },
            ],
          },
          defaultValue: "medium",
        },
        {
          type: "range",
          name: "heightOnDesktop",
          label: "Height on desktop",
          defaultValue: 650,
          configs: {
            min: 400,
            max: 800,
            step: 10,
            unit: "px",
          },
          condition: (data: HeroVideoData) => data.height === "custom",
        },
        {
          type: "range",
          name: "heightOnMobile",
          label: "Height on mobile",
          defaultValue: 300,
          configs: {
            min: 250,
            max: 500,
            step: 10,
            unit: "px",
          },
          condition: (data: HeroVideoData) => data.height === "custom",
        },
        {
          type: "range",
          name: "gap",
          label: "Items spacing",
          configs: {
            min: 0,
            max: 40,
            step: 4,
            unit: "px",
          },
          defaultValue: 20,
        },
        {
          type: "select",
          name: "width",
          label: "Content width",
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
          type: "select",
          name: "verticalPadding",
          label: "Vertical padding",
          configs: {
            options: [
              { value: "none", label: "None" },
              { value: "small", label: "Small" },
              { value: "medium", label: "Medium" },
              { value: "large", label: "Large" },
            ],
          },
          defaultValue: "none",
        },
        {
          type: "position",
          name: "contentPosition",
          label: "Content position",
          defaultValue: "center center",
        },
      ],
    },
    {
      group: "Overlay",
      inputs: overlayInputs,
    },
  ],
  childTypes: ["subheading", "heading", "paragraph", "button"],
  presets: {
    enableOverlay: true,
    overlayColor: "#000000",
    overlayOpacity: 40,
    videoURL: "https://www.youtube.com/watch?v=gbLmku5QACM",
    height: "small",
    contentPosition: "bottom left",
    width: "stretch",
    verticalPadding: "small",
    gap: 20,
    children: [
      {
        type: "subheading",
        content: "Now streaming",
        color: "#fff",
      },
      {
        type: "heading",
        content: "Stories worth telling.",
        as: "h2",
        color: "#fff",
      },
      {
        type: "paragraph",
        content:
          "Immerse your audience in a cinematic experience that moves them to act.",
        color: "#fff",
      },
    ],
  },
});
