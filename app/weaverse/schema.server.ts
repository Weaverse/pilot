import type { HydrogenThemeSchema, SwatchesConfigs } from "@weaverse/hydrogen";
import pkg from "../../package.json";

let swatchesConfigs: SwatchesConfigs = {
  options: [
    {
      id: "1",
      name: "Color",
      displayName: "Select color",
      type: "color",
      size: "md",
      shape: "circle",
    },
    {
      id: "2",
      name: "Size",
      displayName: "Select size",
      type: "button",
      size: "md",
      shape: "round",
    },
  ],
  swatches: {
    colors: [
      { id: "1", name: "Red", value: "#ff0000" },
      { id: "2", name: "Yellow", value: "#ffff00" },
      { id: "3", name: "Black", value: "#000000" },
      { id: "4", name: "Blue", value: "#0000FF" },
      { id: "5", name: "Green", value: "#00ff00" },
      { id: "6", name: "Purple", value: "#800080" },
      { id: "7", name: "Silver", value: "#c0c0c0" },
      { id: "8", name: "White", value: "#ffffff" },
      { id: "9", name: "Brown", value: "#7B3F00" },
      { id: "10", name: "Light-brown", value: "#feb035" },
      { id: "11", name: "Dark-turquoise", value: "#23cddc" },
      { id: "12", name: "Orange", value: "#fe9001" },
      { id: "13", name: "Tan", value: "#eacea7" },
      { id: "14", name: "Violet", value: "#EE82EE" },
      { id: "15", name: "Pink", value: "#FFC0CB" },
      { id: "16", name: "Grey", value: "#808080" },
    ],
    images: [
      {
        id: "1",
        name: "Dark blue",
        value:
          "https://cdn.shopify.com/s/files/1/0838/0052/3057/files/swatch_pattern_2.png",
      },
      {
        id: "2",
        name: "Light orange",
        value:
          "https://cdn.shopify.com/s/files/1/0838/0052/3057/files/swatch_pattern_3.png",
      },
      {
        id: "3",
        name: "Dark red",
        value:
          "https://cdn.shopify.com/s/files/1/0838/0052/3057/files/swatch_pattern_4.png",
      },
      {
        id: "4",
        name: "Light brown",
        value:
          "https://cdn.shopify.com/s/files/1/0838/0052/3057/files/swatch_pattern_5.png",
      },
      {
        id: "5",
        name: "Dark brown",
        value:
          "https://cdn.shopify.com/s/files/1/0838/0052/3057/files/swatch_pattern_6.png",
      },
    ],
  },
};

export let themeSchema: HydrogenThemeSchema = {
  info: {
    version: pkg.version,
    author: "Weaverse",
    name: "Pilot",
    authorProfilePhoto:
      "https://cdn.shopify.com/s/files/1/0838/0052/3057/files/Weaverse_logo_-_3000x_e2fa8c13-dac2-4dcb-a2c2-f7aaf7a58169.png?v=1698245759",
    documentationUrl: "https://weaverse.io/docs",
    supportUrl: "https://weaverse.io/contact",
  },
  inspector: [
    {
      group: "Layout",
      inputs: [
        {
          type: "range",
          label: "Page width",
          name: "pageWidth",
          configs: {
            min: 1000,
            max: 1600,
            step: 10,
            unit: "px",
          },
          defaultValue: 1280,
        },
        {
          type: "range",
          label: "Nav height (mobile)",
          name: "navHeightMobile",
          configs: {
            min: 2,
            max: 8,
            step: 1,
            unit: "rem",
          },
          defaultValue: 3,
        },
        {
          type: "range",
          label: "Nav height (tablet)",
          name: "navHeightTablet",
          configs: {
            min: 2,
            max: 8,
            step: 1,
            unit: "rem",
          },
          defaultValue: 4,
        },
        {
          type: "range",
          label: "Nav height (desktop)",
          name: "navHeightDesktop",
          configs: {
            min: 2,
            max: 8,
            step: 1,
            unit: "rem",
          },
          defaultValue: 6,
        },
      ],
    },
    {
      group: "Announcement bar",
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
          name: "scrollingGap",
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
          type: "switch",
          label: "Enable scrolling",
          name: "enableScrolling",
          defaultValue: false,
          helpText:
            "Scrolling is automatically detected based on the content length.",
        },
        {
          type: "range",
          label: "Scrolling speed",
          name: "scrollingSpeed",
          configs: {
            min: 0,
            max: 100,
            step: 1,
            unit: "s",
          },
          defaultValue: 10,
        },
      ],
    },
    {
      group: "Header",
      inputs: [
        {
          type: "switch",
          label: "Enable transparent header",
          name: "enableTransparentHeader",
          defaultValue: true,
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
          condition: "enableTransparentHeader.eq.true",
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
      ],
    },
    {
      group: "Colors",
      inputs: [
        {
          type: "heading",
          label: "General",
        },
        {
          type: "color",
          label: "Text",
          name: "colorText",
          defaultValue: "#0F0F0F",
        },
        {
          type: "color",
          label: "Background",
          name: "colorBackground",
          defaultValue: "#ffffff",
        },
        {
          type: "color",
          label: "Foreground",
          name: "colorForeground",
          defaultValue: "#e5e7eb",
        },
        {
          type: "color",
          label: "Lines and borders",
          name: "colorLine",
          defaultValue: "#a8a29e",
        },
        {
          type: "heading",
          label: "Announcement bar",
        },
        {
          type: "color",
          label: "Announcement text",
          name: "topbarTextColor",
          defaultValue: "#ffffff",
        },
        {
          type: "color",
          label: "Announcement background",
          name: "topbarBgColor",
          defaultValue: "#000000",
        },
        {
          type: "heading",
          label: "Header",
        },
        {
          type: "color",
          label: "Header background",
          name: "headerBgColor",
          defaultValue: "#ffffff",
        },
        {
          type: "color",
          label: "Header text",
          name: "headerText",
          defaultValue: "#000000",
        },
        {
          type: "color",
          label: "Transparent header text",
          name: "transparentHeaderText",
          defaultValue: "#ffffff",
        },
        {
          type: "heading",
          label: "Footer",
        },
        {
          type: "color",
          label: "Footer background",
          name: "footerBgColor",
          defaultValue: "#000000",
        },
        {
          type: "color",
          label: "Footer text",
          name: "footerText",
          defaultValue: "#ffffff",
        },
        {
          type: "heading",
          label: "Primary button",
        },
        {
          type: "color",
          label: "Background color",
          name: "buttonPrimaryBg",
          defaultValue: "#000000",
        },
        {
          type: "color",
          label: "Text color",
          name: "buttonPrimaryColor",
          defaultValue: "#ffffff",
        },
        {
          type: "heading",
          label: "Secondary button",
        },
        {
          type: "color",
          label: "Background color",
          name: "buttonSecondaryBg",
          defaultValue: "#ffffff",
        },
        {
          type: "color",
          label: "Text color",
          name: "buttonSecondaryColor",
          defaultValue: "#000000",
        },
        {
          type: "heading",
          label: "Outline button",
        },
        {
          type: "color",
          label: "Text and border",
          name: "buttonOutlineTextAndBorder",
          defaultValue: "#000000",
        },
        {
          type: "heading",
          label: "Drawers and popovers",
        },
        {
          type: "color",
          label: "Background color",
          name: "drawersBg",
          defaultValue: "#ffffff",
        },
        {
          type: "heading",
          label: "Product",
        },
        {
          type: "color",
          label: "Compare price text",
          name: "comparePriceTextColor",
          defaultValue: "#737373",
        },
        {
          type: "color",
          label: "Sale tags",
          name: "saleTagColor",
          defaultValue: "#dc2626",
        },
        {
          type: "color",
          label: "New tags",
          name: "newTagColor",
          defaultValue: "#4d4d4d",
        },
        {
          type: "color",
          label: "Other tags",
          name: "otherTagColor",
          defaultValue: "#1e293b",
        },
        {
          type: "color",
          label: "Sold out & unavailable",
          name: "soldOutAndUnavailable",
          defaultValue: "#d4d4d4",
        },
        {
          type: "color",
          label: "Star rating",
          name: "starRating",
          defaultValue: "#fde047",
        },
      ],
    },
    {
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
    },
    {
      group: "Product swatches",
      inputs: [
        {
          type: "swatches",
          name: "productSwatches",
          label: "Config swatches",
          defaultValue: swatchesConfigs,
        },
      ],
    },
    {
      group: "Animations and effects",
      inputs: [
        {
          type: "switch",
          label: "Enable view transition",
          name: "enableViewTransition",
          defaultValue: true,
        },
      ],
    },
    {
      group: "Product quick view",
      inputs: [
        {
          type: "text",
          label: "Add to cart text",
          name: "addToCartText",
          defaultValue: "Add to cart",
          placeholder: "Add to cart",
        },
        {
          type: "text",
          label: "Sold out text",
          name: "soldOutText",
          defaultValue: "Sold out",
          placeholder: "Sold out",
        },
        {
          type: "text",
          label: "Unavailable text",
          name: "unavailableText",
          defaultValue: "Unavailable",
          placeholder: "Unavailable",
        },
        {
          type: "switch",
          label: "Show vendor",
          name: "showVendor",
          defaultValue: true,
        },
        {
          type: "switch",
          label: "Show sale price",
          name: "showSalePrice",
          defaultValue: true,
        },
        {
          type: "switch",
          label: "Show details",
          name: "showDetails",
          defaultValue: true,
        },
        {
          type: "switch",
          label: "Show shipping policy",
          name: "showShippingPolicy",
          defaultValue: true,
        },
        {
          type: "switch",
          label: "Show refund policy",
          name: "showRefundPolicy",
          defaultValue: true,
        },
        {
          label: "Hide unavailable options",
          type: "switch",
          name: "hideUnavailableOptions",
        },
        {
          label: "Show thumbnails",
          name: "showThumbnails",
          type: "switch",
          defaultValue: true,
        },
        {
          label: "Number of thumbnails",
          name: "numberOfThumbnails",
          type: "range",
          condition: "showThumbnails.eq.true",
          configs: {
            min: 1,
            max: 10,
          },
          defaultValue: 4,
        },
        {
          label: "Gap between images",
          name: "spacing",
          type: "range",
          configs: {
            min: 0,
            step: 2,
            max: 100,
          },
          defaultValue: 10,
        },
      ],
    },
    {
      group: "Footer",
      inputs: [
        {
          type: "select",
          name: "footerWidth",
          label: "Footer content width",
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
    },
  ],
};
