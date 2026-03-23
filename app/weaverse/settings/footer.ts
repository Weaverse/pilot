import type { InspectorGroup } from "@weaverse/hydrogen";

export const footerSettings: InspectorGroup = {
  group: "Footer",
  inputs: [
    {
      type: "select",
      name: "footerWidth",
      label: "Footer width",
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
      type: "image",
      name: "footerLogoData",
      label: "Logo",
      defaultValue: "",
    },
    {
      type: "range",
      name: "footerLogoWidth",
      label: "Logo width",
      configs: {
        min: 20,
        max: 200,
        step: 1,
        unit: "px",
      },
      defaultValue: 80,
    },
    {
      type: "richtext",
      name: "bio",
      label: "Store bio",
      defaultValue:
        "<p>We are a team of designers, developers, and creatives who are passionate about creating beautiful and functional products.</p>",
    },
    {
      type: "heading",
      label: "Social links",
    },
    {
      type: "text",
      name: "socialInstagram",
      label: "Instagram",
      defaultValue: "https://www.instagram.com/",
    },
    {
      type: "text",
      name: "socialX",
      label: "X (formerly Twitter)",
      defaultValue: "https://x.com/i/communities/1636383560197373952",
    },
    {
      type: "text",
      name: "socialLinkedIn",
      label: "LinkedIn",
      defaultValue: "https://www.linkedin.com/company/weaverseio",
    },
    {
      type: "text",
      name: "socialFacebook",
      label: "Facebook",
      defaultValue: "https://www.facebook.com/weaverse",
    },
    {
      type: "heading",
      label: "Store information",
    },
    {
      type: "text",
      name: "addressTitle",
      label: "Title",
      defaultValue: "OUR SHOP",
      placeholder: "Our shop",
    },
    {
      type: "text",
      name: "storeAddress",
      label: "Address",
      defaultValue: "301 Front St W, Toronto, ON M5V 2T6, Canada",
      placeholder: "301 Front St W, Toronto, ON M5V 2T6, Canada",
    },
    {
      type: "text",
      name: "storeEmail",
      label: "Email",
      defaultValue: "contact@my-store.com",
      placeholder: "contact@my-store.com",
    },
    {
      type: "heading",
      label: "Newsletter",
    },
    {
      type: "text",
      name: "newsletterTitle",
      label: "Title",
      defaultValue: "STAY IN TOUCH",
      placeholder: "Stay in touch",
    },
    {
      type: "text",
      name: "newsletterDescription",
      label: "Description",
      defaultValue: "News and inspiration in your inbox, every week.",
    },
    {
      type: "text",
      name: "newsletterPlaceholder",
      label: "Input placeholder",
      defaultValue: "Please enter your email",
      placeholder: "Please enter your email",
    },
    {
      type: "text",
      name: "newsletterButtonText",
      label: "Button text",
      defaultValue: "Send",
      placeholder: "Send",
    },
    {
      type: "richtext",
      name: "copyright",
      label: "Copyright text",
      defaultValue: "© 2024 Weaverse. All rights reserved.",
    },
  ],
};
