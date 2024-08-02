import type { HydrogenThemeSchema } from "@weaverse/hydrogen";
import pkg from "../../package.json";

let variantSwatch = {
  configs: [],
  swatches: {
    imageSwatches: [],
    colorSwatches: [],
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
          type: "color",
          label: "Background",
          name: "colorBackground",
          defaultValue: "#ffffff",
        },
        {
          type: "color",
          label: "Inverse background",
          name: "colorInverseBackground",
          defaultValue: "#0f0f0f",
        },
        {
          type: "color",
          label: "Text",
          name: "colorText",
          defaultValue: "#0F0F0F",
        },
        // {
        //   type: "color",
        //   label: "Inverse text",
        //   name: "colorInverseText",
        //   defaultValue: "#ffffff",
        // },
        // {
        //   type: "color",
        //   label: "Button",
        //   name: "colorButton",
        //   defaultValue: "#0F0F0F",
        // },
        // {
        //   type: "color",
        //   label: "Button text",
        //   name: "colorButtonText",
        //   defaultValue: "#FFF",
        // },
        // {
        //   type: "color",
        //   label: "Inverse button",
        //   name: "colorInverseButton",
        //   defaultValue: "#FFF",
        // },
        // {
        //   type: "color",
        //   label: "Inverse button text",
        //   name: "colorInverseButtonText",
        //   defaultValue: "#0F0F0F",
        // },
        {
          type: "color",
          label: "Sale",
          name: "colorSale",
          defaultValue: "#DE4B4B",
        },
        {
          type: "color",
          label: "Border",
          name: "colorBorder",
          defaultValue: "#696662",
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
      group: "Buttons",
      inputs: [
        {
          type: "heading",
          label: "Primary",
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
          type: "color",
          label: "Border color",
          name: "buttonPrimaryBorder",
          defaultValue: "#000000",
        },
        {
          type: "color",
          label: "Background color (hover)",
          name: "buttonPrimaryBgHover",
          defaultValue: "#ffffff",
        },
        {
          type: "color",
          label: "Text color (hover)",
          name: "buttonPrimaryColorHover",
          defaultValue: "#000000",
        },
        {
          type: "color",
          label: "Border color (hover)",
          name: "buttonPrimaryBorderHover",
          defaultValue: "#000000",
        },
        {
          type: "heading",
          label: "Secondary",
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
          type: "color",
          label: "Border color",
          name: "buttonSecondaryBorder",
          defaultValue: "#000000",
        },
        {
          type: "color",
          label: "Background color (hover)",
          name: "buttonSecondaryBgHover",
          defaultValue: "#000000",
        },
        {
          type: "color",
          label: "Text color (hover)",
          name: "buttonSecondaryColorHover",
          defaultValue: "#ffffff",
        },
        {
          type: "color",
          label: "Border color (hover)",
          name: "buttonSecondaryBorderHover",
          defaultValue: "#000000",
        },
        {
          type: "heading",
          label: "Outline",
        },
        {
          type: "color",
          label: "Background color",
          name: "buttonOutlineBg",
          defaultValue: "#0000000000",
        },
        {
          type: "color",
          label: "Text color",
          name: "buttonOutlineColor",
          defaultValue: "#000000",
        },
        {
          type: "color",
          label: "Border color",
          name: "buttonOutlineBorder",
          defaultValue: "#000000",
        },
        {
          type: "color",
          label: "Background color (hover)",
          name: "buttonOutlineBgHover",
          defaultValue: "#000000",
        },
        {
          type: "color",
          label: "Text color (hover)",
          name: "buttonOutlineColorHover",
          defaultValue: "#ffffff",
        },
        {
          type: "color",
          label: "Border color (hover)",
          name: "buttonOutlineBorderHover",
          defaultValue: "#000000",
        },
        {
          type: "heading",
          label: "Link",
        },
        {
          type: "color",
          label: "Text color",
          name: "buttonLinkColor",
          defaultValue: "#000000",
        },
        {
          type: "color",
          label: "Text color (hover)",
          name: "buttonLinkColorHover",
          defaultValue: "#000000",
        },
      ],
    },
    {
      group: "Product swatches",
      inputs: [
        {
          type: "swatches",
          name: "swatches",
          label: "Config swatches",
          defaultValue: variantSwatch,
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
      group: "Product quick view modal",
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
      group: "Announcement bar",
      inputs: [
        {
          type: "richtext",
          name: "announcementBarText",
          label: "Text",
          defaultValue: "FREE SHIPPING FOR ORDERS OVER $200USD",
        },
        {
          type: "range",
          label: "Height",
          name: "announcementBarHeight",
          configs: {
            min: 10,
            max: 100,
            step: 1,
            unit: "px",
          },
          defaultValue: 48,
        },
        {
          type: "range",
          label: "Font size",
          name: "announcementBarFontSize",
          configs: {
            min: 6,
            max: 100,
            step: 1,
            unit: "px",
          },
          defaultValue: 16,
        },
        {
          type: "color",
          label: "Text color",
          name: "announcementBarTextColor",
          defaultValue: "#ffffff",
        },
        {
          type: "color",
          label: "Background color",
          name: "announcementBarBgColor",
          defaultValue: "#000000",
        },
        {
          type: "switch",
          label: "Dismissable",
          name: "dismisableAnnouncementBar",
          defaultValue: true,
        },
        {
          type: "switch",
          label: "Sticky",
          name: "stickyAnnouncementBar",
          defaultValue: true,
        },
        {
          type: "switch",
          label: "Enable scrolling",
          name: "enableScrolling",
          defaultValue: false,
        },
        {
          type: "range",
          label: "Gap between content",
          name: "scrollingGap",
          configs: {
            min: 0,
            max: 100,
            step: 1,
            unit: "px",
          },
          defaultValue: 44,
          condition: "enableScrolling.eq.true",
        },
        {
          type: "range",
          label: "Scrolling speed",
          name: "scrollingSpeed",
          configs: {
            min: 0,
            max: 100,
            step: 1,
          },
          defaultValue: 10,
          condition: "enableScrolling.eq.true",
        }
      ]
    },
    {
      group: "Footer settings",
      inputs: [
        {
          type: "image",
          name: "footerLogoData",
          label: "Logo",
          defaultValue: {
            id: "gid://shopify/MediaImage/34144817938616",
            altText: "Logo",
            url: "https://cdn.shopify.com/s/files/1/0838/0052/3057/files/transparent_Pilot_logo.png?v=1718763594",
            width: 320,
            height: 116,
          },
        },
        {
          type: "richtext",
          name: "bio",
          label: "Store Bio",
          defaultValue:
            "<p>We are a team of designers, developers, and creatives who are passionate about creating beautiful and functional products.</p>",
        },
        {
          type: "richtext",
          name: "copyright",
          label: "Copyright",
          defaultValue: "© 2024 Weaverse. All rights reserved.",
        },
        {
          type: "heading",
          label: "Social links",
        },
        {
          type: "url",
          name: "socialFacebook",
          label: "Facebook",
          defaultValue: "https://www.facebook.com/weaverse",
        },
        {
          type: "url",
          name: "socialInstagram",
          label: "Instagram",
          defaultValue: "https://www.instagram.com/",
        },
        {
          type: "url",
          name: "socialLinkedIn",
          label: "LinkedIn",
          defaultValue: "https://www.linkedin.com/company/weaverseio",
        },
        {
          type: "url",
          name: "socialX",
          label: "X",
          defaultValue: "https://x.com/i/communities/1636383560197373952",
        },
        {
          type: "heading",
          label: "Store Info",
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
          defaultValue: "131 Iroquois Street Southgate, MI 48195",
          placeholder: "123 Main Street",
        },
        {
          type: "text",
          name: "storeEmail",
          label: "Email",
          defaultValue: "info@weaverse.io",
          placeholder: "info@weaverse.io",
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
      ],
    }
  ],
};
