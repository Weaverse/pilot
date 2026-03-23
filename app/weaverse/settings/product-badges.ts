import type { InspectorGroup } from "@weaverse/hydrogen";

export const productBadgesSettings: InspectorGroup = {
  group: "Product badges",
  inputs: [
    {
      type: "range",
      label: "Border radius",
      name: "badgeBorderRadius",
      configs: {
        min: 0,
        max: 10,
        step: 2,
        unit: "px",
      },
      defaultValue: 0,
    },
    {
      type: "select",
      label: "Text transform",
      name: "badgeTextTransform",
      configs: {
        options: [
          { value: "none", label: "None" },
          { value: "uppercase", label: "Uppercase" },
          { value: "lowercase", label: "Lowercase" },
          { value: "capitalize", label: "Capitalize" },
        ],
      },
      defaultValue: "Uppercase",
    },
    {
      type: "text",
      label: "Best Seller / Hot text",
      name: "bestSellerBadgeText",
      defaultValue: "Best Seller",
      placeholder: "Best Seller",
    },
    {
      type: "text",
      label: "New text",
      name: "newBadgeText",
      defaultValue: "New",
      placeholder: "New",
    },
    {
      type: "range",
      label: "Days old",
      name: "newBadgeDaysOld",
      configs: {
        min: 0,
        max: 365,
        step: 1,
      },
      defaultValue: 30,
      helpText:
        "The <strong>New</strong> badge will be shown if the product is published within the last days.",
    },
    {
      type: "text",
      label: "Bundle text",
      name: "bundleBadgeText",
      defaultValue: "Bundle",
      placeholder: "Bundle",
    },
    {
      type: "text",
      label: "Sold out text",
      name: "soldOutBadgeText",
      defaultValue: "Sold out",
      placeholder: "Sold out",
    },
    {
      type: "textarea",
      label: "Sale badge text",
      name: "saleBadgeText",
      defaultValue: "-[percentage]% Off",
      placeholder: "-[percentage]% Off, Saved [amount], or Sale",
      helpText: [
        "<p class='mb-1'>- Use <strong>[percentage]</strong> to display the discount percentage.</p>",
        "<p class='mb-1'>- Use <strong>[amount]</strong> to display the discount amount.</p>",
        "<p>E.g. <strong>-[percentage]% Off</strong>, <strong>Saved [amount]</strong>, or <strong>Sale</strong>.</p>",
      ].join(""),
    },
  ],
};
