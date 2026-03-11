import type { InspectorGroup } from "@weaverse/hydrogen";

export const cartSettings: InspectorGroup = {
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
      defaultValue: "Add a note",
      placeholder: "Add a note",
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
      defaultValue: "Add a discount code",
      placeholder: "Add a discount code",
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
      defaultValue: "Redeem a gift card",
      placeholder: "Redeem a gift card",
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
};
