import type { InspectorGroup } from "@weaverse/hydrogen";

export const newsletterSettings: InspectorGroup = {
  group: "Newsletter Popup",
  inputs: [
    {
      type: "switch",
      label: "Enable newsletter popup",
      name: "newsletterPopupEnabled",
      defaultValue: true,
    },
    {
      type: "select",
      label: "Popup type",
      name: "newsletterPopupType",
      configs: {
        options: [
          { value: "popup", label: "Popup" },
          { value: "modal", label: "Modal" },
        ],
      },
      defaultValue: "popup",
      condition: (theme) => theme.newsletterPopupEnabled === true,
    },
    {
      type: "range",
      label: "Delay until popup appears",
      name: "newsletterPopupDelay",
      configs: {
        min: 0,
        max: 20,
        step: 1,
        unit: "s",
      },
      defaultValue: 5,
      condition: (theme) => theme.newsletterPopupEnabled === true,
    },
    {
      type: "switch",
      label: "Show only on home page",
      name: "newsletterPopupHomeOnly",
      defaultValue: true,
      condition: (theme) => theme.newsletterPopupEnabled === true,
    },
    {
      type: "switch",
      label: "Allow dismiss",
      name: "newsletterPopupAllowDismiss",
      defaultValue: false,
      condition: (theme) => theme.newsletterPopupEnabled === true,
    },
    {
      type: "select",
      label: "Popup position",
      name: "newsletterPopupPosition",
      configs: {
        options: [
          { value: "top-left", label: "Top Left" },
          { value: "top-right", label: "Top Right" },
          { value: "bottom-left", label: "Bottom Left" },
          { value: "bottom-right", label: "Bottom Right" },
        ],
      },
      defaultValue: "bottom-right",
      condition: (theme) =>
        theme.newsletterPopupEnabled === true &&
        theme.newsletterPopupType === "popup",
    },
    {
      type: "image",
      label: "Image",
      name: "newsletterPopupImage",
      defaultValue: {
        id: "gid://shopify/MediaImage/0",
        altText: "Newsletter signup",
        url: "https://cdn.shopify.com/s/files/1/0838/0052/3057/files/h2-placeholder-image.svg",
        width: 600,
        height: 800,
      },
      condition: (theme) => theme.newsletterPopupEnabled === true,
    },
    {
      type: "select",
      label: "Image position",
      name: "newsletterPopupImagePosition",
      configs: {
        options: [
          { value: "top", label: "Top" },
          { value: "left", label: "Left" },
          { value: "right", label: "Right" },
        ],
      },
      defaultValue: "left",
      helpText: "Image position for desktop devices only",
      condition: (theme) =>
        theme.newsletterPopupEnabled === true && theme.newsletterPopupImage,
    },
    {
      type: "text",
      label: "Heading",
      name: "newsletterPopupHeading",
      defaultValue: "Stay in the loop!",
      placeholder: "Stay in the loop!",
      condition: (theme) => theme.newsletterPopupEnabled === true,
    },
    {
      type: "textarea",
      label: "Description",
      name: "newsletterPopupDescription",
      defaultValue:
        "Subscribe to our newsletter and get exclusive offers, new product updates, and more.",
      placeholder: "Subscribe to our newsletter...",
      condition: (theme) => theme.newsletterPopupEnabled === true,
    },
    {
      type: "text",
      label: "Button text",
      name: "newsletterPopupButtonText",
      defaultValue: "Get 15% Off Your First Order",
      placeholder: "Subscribe",
      condition: (theme) => theme.newsletterPopupEnabled === true,
    },
  ],
};
