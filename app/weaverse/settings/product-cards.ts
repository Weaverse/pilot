import type { InspectorGroup } from "@weaverse/hydrogen";

export const productCardsSettings: InspectorGroup = {
  group: "Product cards",
  inputs: [
    {
      type: "color",
      name: "pcardBackgroundColor",
      label: "Background color",
      defaultValue: "",
    },
    {
      type: "range",
      name: "pcardBorderRadius",
      label: "Border radius",
      configs: {
        min: 0,
        max: 40,
        step: 2,
        unit: "px",
      },
      defaultValue: 0,
    },
    {
      type: "heading",
      label: "Image",
    },
    {
      type: "switch",
      name: "pcardShowImageOnHover",
      label: "Show second image on hover",
      defaultValue: true,
    },
    {
      type: "select",
      name: "pcardImageRatio",
      label: "Image aspect ratio",
      defaultValue: "adapt",
      configs: {
        options: [
          { value: "adapt", label: "Adapt to image" },
          { value: "1/1", label: "Square (1/1)" },
          { value: "3/4", label: "Portrait (3/4)" },
          { value: "4/3", label: "Landscape (4/3)" },
          { value: "16/9", label: "Widescreen (16/9)" },
        ],
      },
      helpText:
        'Learn more about image <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/aspect-ratio" target="_blank" rel="noopener noreferrer">aspect ratio</a> property.',
    },
    {
      type: "heading",
      label: "Content",
    },
    {
      type: "select",
      label: "Title & prices alignment",
      name: "pcardTitlePricesAlignment",
      configs: {
        options: [
          { value: "horizontal", label: "Horizontal" },
          { value: "vertical", label: "Vertical" },
        ],
      },
      defaultValue: "horizontal",
    },
    {
      type: "toggle-group",
      name: "pcardAlignment",
      label: "Content alignment",
      configs: {
        options: [
          { value: "left", label: "Left", icon: "align-start-vertical" },
          {
            value: "center",
            label: "Center",
            icon: "align-center-vertical",
          },
          { value: "right", label: "Right", icon: "align-end-vertical" },
        ],
      },
      defaultValue: "center",
      condition: (theme) => theme.pcardTitlePricesAlignment === "vertical",
    },
    {
      type: "switch",
      label: "Show vendor",
      name: "pcardShowVendor",
      defaultValue: true,
    },
    {
      type: "switch",
      label: "Show reviews (stars rating)",
      name: "pcardShowReviews",
      defaultValue: true,
    },
    {
      type: "switch",
      label: "Show lowest price",
      name: "pcardShowLowestPrice",
      defaultValue: false,
    },
    {
      type: "switch",
      label: "Show sale price",
      name: "pcardShowSalePrice",
      defaultValue: true,
      condition: (theme) => theme.pcardShowLowestPrice !== true,
    },
    {
      type: "switch",
      label: "Show option values",
      name: "pcardShowOptionValues",
      defaultValue: true,
    },
    {
      type: "text",
      label: "Option to show",
      name: "pcardOptionToShow",
      defaultValue: "Color",
      placeholder: "Color",
      condition: (theme) => theme.pcardShowOptionValues === true,
    },
    {
      type: "range",
      label: "Max option values to show",
      name: "pcardMaxOptionValues",
      configs: {
        min: 2,
        max: 10,
      },
      defaultValue: 5,
      condition: (theme) => theme.pcardShowOptionValues === true,
    },
    {
      type: "heading",
      label: "Quick shop",
    },
    {
      type: "switch",
      label: "Enable quick shop",
      name: "pcardEnableQuickShop",
      defaultValue: true,
    },
    {
      type: "switch",
      label: "Show when hovering product card",
      name: "pcardShowQuickShopOnHover",
      defaultValue: true,
      condition: (theme) => theme.pcardEnableQuickShop === true,
    },
    {
      type: "select",
      label: "Quick shop button type",
      name: "pcardQuickShopButtonType",
      configs: {
        options: [
          { value: "icon", label: "Icon button" },
          { value: "text", label: "Text button" },
        ],
      },
      defaultValue: "icon",
      condition: (theme) => theme.pcardEnableQuickShop === true,
    },
    {
      type: "text",
      label: "Quick shop button text",
      name: "pcardQuickShopButtonText",
      defaultValue: "Quick shop",
      placeholder: "Quick shop",
      condition: (theme) => {
        return (
          theme.pcardEnableQuickShop === true &&
          theme.pcardQuickShopButtonType === "text"
        );
      },
    },
    {
      type: "select",
      label: "Quick shop panel type",
      name: "pcardQuickShopPanelType",
      configs: {
        options: [
          { value: "modal", label: "Modal" },
          { value: "drawer", label: "Drawer" },
        ],
      },
      defaultValue: "modal",
      condition: (theme) => theme.pcardEnableQuickShop === true,
    },
    {
      type: "heading",
      label: "Variant media grouping",
      condition: (theme) => theme.pcardEnableQuickShop === true,
    },
    {
      type: "switch",
      label: "Group media by variant in quick shop",
      name: "quickShopGroupMediaByVariant",
      defaultValue: true,
      helpText:
        "When enabled, only images matching the selected variant option will be displayed in the quick shop modal/drawer",
      condition: (theme) => theme.pcardEnableQuickShop === true,
    },
    {
      type: "text",
      label: "Group by option name",
      name: "quickShopGroupByOption",
      defaultValue: "Color",
      placeholder: "Color",
      helpText:
        "The product option name used to group media (e.g., Color, Colour)",
      condition: (theme) =>
        theme.pcardEnableQuickShop === true &&
        theme.quickShopGroupMediaByVariant === true,
    },
    {
      type: "heading",
      label: "Badges",
    },
    {
      type: "switch",
      label: "Show sale badge",
      name: "pcardShowSaleBadge",
      defaultValue: true,
    },
    {
      type: "switch",
      label: "Show bundle badge",
      name: "pcardShowBundleBadge",
      defaultValue: true,
    },
    {
      type: "switch",
      label: "Show Hot / Best Seller badge",
      name: "pcardShowBestSellerBadge",
      defaultValue: true,
    },
    {
      type: "switch",
      label: "Show New badge",
      name: "pcardShowNewBadge",
      defaultValue: true,
    },
    {
      type: "switch",
      label: "Show Out of stock badge",
      name: "pcardShowOutOfStockBadge",
      defaultValue: false,
    },
  ],
};
