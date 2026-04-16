import { createSchema, IMAGES_PLACEHOLDERS } from "@weaverse/hydrogen";
import type { SlideshowData } from "./index";

export const schema = createSchema({
  title: "Slideshow",
  type: "slideshow",
  childTypes: ["slideshow-slide"],
  settings: [
    {
      group: "Slideshow",
      inputs: [
        {
          type: "select",
          name: "height",
          label: "Section height",
          configs: {
            options: [
              { value: "small", label: "Small" },
              { value: "medium", label: "Medium" },
              { value: "large", label: "Large" },
              { value: "full", label: "Fullscreen" },
            ],
          },
          defaultValue: "large",
        },
        {
          type: "toggle-group",
          label: "Slide effect",
          name: "effect",
          configs: {
            options: [
              { value: "fade", label: "Fade" },
              { value: "slide", label: "Slide" },
            ],
          },
          defaultValue: "fade",
        },
        {
          type: "switch",
          label: "Auto-rotate slides",
          name: "autoRotate",
          defaultValue: true,
        },
        {
          type: "range",
          label: "Change slides every",
          name: "changeSlidesEvery",
          configs: {
            min: 3,
            max: 9,
            step: 1,
            unit: "s",
          },
          defaultValue: 5,
          condition: (data: SlideshowData) => data.autoRotate,
          helpText: "Auto-rotate is disabled inside Weaverse Studio.",
        },
        {
          type: "switch",
          label: "Loop",
          name: "loop",
          defaultValue: true,
        },
      ],
    },
    {
      group: "Navigation & Controls",
      inputs: [
        {
          type: "heading",
          label: "Arrows",
        },
        {
          type: "switch",
          label: "Show arrows",
          name: "showArrows",
          defaultValue: false,
        },
        {
          type: "select",
          label: "Arrow icon",
          name: "arrowsIcon",
          configs: {
            options: [
              { value: "caret", label: "Caret" },
              { value: "arrow", label: "Arrow" },
            ],
          },
          defaultValue: "arrow",
          condition: (data: SlideshowData) => data.showArrows,
        },
        {
          type: "range",
          label: "Icon size",
          name: "iconSize",
          configs: {
            min: 16,
            max: 40,
            step: 2,
          },
          defaultValue: 20,
          condition: (data: SlideshowData) => data.showArrows,
        },
        {
          type: "switch",
          label: "Show arrows on hover",
          name: "showArrowsOnHover",
          defaultValue: true,
          condition: (data: SlideshowData) => data.showArrows,
        },
        {
          type: "select",
          label: "Arrows color",
          name: "arrowsColor",
          configs: {
            options: [
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
            ],
          },
          defaultValue: "light",
          condition: (data: SlideshowData) => data.showArrows,
        },
        {
          type: "select",
          label: "Arrows shape",
          name: "arrowsShape",
          configs: {
            options: [
              { value: "auto", label: "Auto" },
              { value: "circle", label: "Circle" },
            ],
          },
          defaultValue: "auto",
          condition: (data: SlideshowData) => data.showArrows,
        },

        {
          type: "heading",
          label: "Dots",
        },
        {
          type: "switch",
          label: "Show dots",
          name: "showDots",
          defaultValue: true,
        },
        {
          type: "select",
          label: "Dots style",
          name: "dotsStyle",
          configs: {
            options: [
              { value: "circle", label: "Circle" },
              { value: "line", label: "Line" },
              { value: "dash", label: "Dash" },
            ],
          },
          defaultValue: "line",
          condition: (data: SlideshowData) => data.showDots,
        },
        {
          type: "select",
          label: "Dots position",
          name: "dotsPosition",
          configs: {
            options: [
              { value: "top", label: "Top" },
              { value: "bottom", label: "Bottom" },
              { value: "left", label: "Left" },
              { value: "right", label: "Right" },
            ],
          },
          defaultValue: "bottom",
          condition: (data: SlideshowData) => data.showDots,
        },
        {
          type: "select",
          label: "Dots color",
          name: "dotsColor",
          configs: {
            options: [
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
            ],
          },
          defaultValue: "light",
          condition: (data: SlideshowData) => data.showDots,
        },
      ],
    },
  ],
  presets: {
    children: [
      {
        type: "slideshow-slide",
        verticalPadding: "large",
        contentPosition: "center center",
        backgroundImage: IMAGES_PLACEHOLDERS.banner_1,
        backgroundFit: "cover",
        enableOverlay: true,
        overlayOpacity: 50,
        children: [
          {
            type: "subheading",
            content: "New season, new style",
            color: "#fff",
          },
          {
            type: "heading",
            content: "Dress for the life you want",
            color: "#fff",
            size: "scale",
            minSize: 16,
            maxSize: 56,
          },
          {
            type: "paragraph",
            content:
              "Comfort meets confidence. Explore our curated collection of everyday essentials and statement pieces — all up to 50% off for a limited time.",
            color: "#fff",
          },
          {
            type: "button",
            text: "Shop now",
            variant: "custom",
            backgroundColor: "#00000000",
            textColor: "#fff",
            borderColor: "#fff",
            backgroundColorHover: "#fff",
            textColorHover: "#000",
            borderColorHover: "#fff",
          },
        ],
      },
      {
        type: "slideshow-slide",
        verticalPadding: "large",
        contentPosition: "center center",
        backgroundImage: IMAGES_PLACEHOLDERS.banner_2,
        backgroundFit: "cover",
        enableOverlay: true,
        overlayOpacity: 50,
        children: [
          {
            type: "subheading",
            content: "Just dropped",
            color: "#fff",
          },
          {
            type: "heading",
            content: "Less noise, more wardrobe",
            color: "#fff",
            size: "scale",
            minSize: 16,
            maxSize: 56,
          },
          {
            type: "paragraph",
            content:
              "Timeless pieces designed to move with you. From weekend layers to workday staples, find what fits your world — now up to 60% off.",
            color: "#fff",
          },
          {
            type: "button",
            text: "Explore the drop",
            variant: "custom",
            backgroundColor: "#00000000",
            textColor: "#fff",
            borderColor: "#fff",
            backgroundColorHover: "#fff",
            textColorHover: "#000",
            borderColorHover: "#fff",
          },
        ],
      },
      {
        type: "slideshow-slide",
        verticalPadding: "large",
        contentPosition: "center center",
        backgroundImage: IMAGES_PLACEHOLDERS.banner_1,
        backgroundFit: "cover",
        enableOverlay: true,
        overlayOpacity: 50,
        children: [
          {
            type: "subheading",
            content: "Members only",
            color: "#fff",
          },
          {
            type: "heading",
            content: "Your next favorite thing is here",
            color: "#fff",
            size: "scale",
            minSize: 16,
            maxSize: 56,
          },
          {
            type: "paragraph",
            content:
              "Early access to new collections, exclusive colorways, and members-only pricing. Join now and never miss a drop.",
            color: "#fff",
          },
          {
            type: "button",
            text: "Join the club",
            variant: "custom",
            backgroundColor: "#00000000",
            textColor: "#fff",
            borderColor: "#fff",
            backgroundColorHover: "#fff",
            textColorHover: "#000",
            borderColorHover: "#fff",
          },
        ],
      },
    ],
  },
});
