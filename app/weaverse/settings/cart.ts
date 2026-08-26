import type { InspectorGroup } from "@weaverse/hydrogen";

export const cartSettings = {
  group: "Cart",
  inputs: [
    {
      type: "switch",
      label: "Enable cart note",
      name: "enableCartNote",
      defaultValue: true,
    },
    {
      type: "text",
      label: "Cart note button text",
      name: "cartNoteButtonText",
      defaultValue: "Note",
      placeholder: "Note",
      condition: (theme) => theme.enableCartNote === true,
    },
    {
      type: "switch",
      label: "Enable discount code",
      name: "enableDiscountCode",
      defaultValue: true,
    },
    {
      type: "text",
      label: "Discount code button text",
      name: "discountCodeButtonText",
      defaultValue: "Discount code",
      placeholder: "Discount code",
      condition: (theme) => theme.enableDiscountCode === true,
    },
    {
      type: "switch",
      label: "Enable gift card",
      name: "enableGiftCard",
      defaultValue: true,
    },
    {
      type: "text",
      label: "Gift card button text",
      name: "giftCardButtonText",
      defaultValue: "Gift card",
      placeholder: "Gift card",
      condition: (theme) => theme.enableGiftCard === true,
    },
    {
      type: "text",
      label: "Checkout button text",
      name: "checkoutButtonText",
      defaultValue: "Continue to Checkout",
      placeholder: "Continue to Checkout",
    },
  ],
} as const satisfies InspectorGroup;
