import type { InspectorGroup } from "@weaverse/hydrogen";

export const colorSettings: InspectorGroup = {
  group: "Colors",
  inputs: [
    {
      type: "heading",
      label: "General",
    },
    {
      type: "color",
      label: "Background",
      name: "colorBackground",
      defaultValue: "#ffffff",
    },
    {
      type: "color",
      label: "Text",
      name: "colorText",
      defaultValue: "#0F0F0F",
    },
    {
      type: "color",
      label: "Text (subtle)",
      name: "colorTextSubtle",
      defaultValue: "#88847F",
    },
    {
      type: "color",
      label: "Text (inverse)",
      name: "colorTextInverse",
      defaultValue: "#fff",
    },
    {
      type: "color",
      label: "Borders",
      name: "colorLine",
      defaultValue: "#3B352C",
    },
    {
      type: "color",
      label: "Borders (subtle)",
      name: "colorLineSubtle",
      defaultValue: "#A19B91",
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
      label: "Button (primary)",
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
      label: "Button (secondary)",
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
      label: "Button (outline)",
    },
    {
      type: "color",
      label: "Text and border",
      name: "buttonOutlineTextAndBorder",
      defaultValue: "#000000",
    },
    {
      type: "heading",
      label: "Badges / labels / tags",
    },
    {
      type: "color",
      label: "Discounts",
      name: "saleBadgeColor",
      defaultValue: "#c6512c",
    },
    {
      type: "color",
      label: "New",
      name: "newBadgeColor",
      defaultValue: "#67785d",
    },
    {
      type: "color",
      label: "Best seller / Hot",
      name: "bestSellerBadgeColor",
      defaultValue: "#000000",
    },
    {
      type: "color",
      label: "Bundle",
      name: "bundleBadgeColor",
      defaultValue: "#10804c",
    },
    {
      type: "color",
      label: "Sold out / unavailable",
      name: "soldOutBadgeColor",
      defaultValue: "#d4d4d4",
    },
    {
      type: "heading",
      label: "Others",
    },
    {
      type: "color",
      label: "Compare price text",
      name: "comparePriceTextColor",
      defaultValue: "#84807B",
    },
    {
      type: "color",
      label: "Product reviews",
      name: "productReviewsColor",
      defaultValue: "#108474",
    },
  ],
};
