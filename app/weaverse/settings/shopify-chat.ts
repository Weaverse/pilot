import type { InspectorGroup } from "@weaverse/hydrogen";

/**
 * Appearance knobs for the Shopify Inbox chat launcher. Shopify's widget is
 * rendered inside a Shopify-hosted frame/shadow root, so these documented
 * loader params are the only supported way to style it — see
 * `app/components/shopify-inbox.tsx`.
 *
 * The widget only renders when `PUBLIC_SHOPIFY_INBOX_SHOP_ID` is configured.
 */
export const shopifyChatSettings = {
  group: "Shopify chat (Inbox)",
  inputs: [
    {
      type: "select",
      label: "Position",
      name: "shopifyChatPosition",
      configs: {
        options: [
          { value: "bottom_left", label: "Bottom left" },
          { value: "bottom_right", label: "Bottom right" },
        ],
      },
      defaultValue: "bottom_left",
      helpText:
        "Requires the Shopify Inbox shop ID to be set in your storefront environment variables.",
    },
    {
      type: "switch",
      label: "Use theme chat button",
      name: "shopifyChatCustomButton",
      defaultValue: false,
      helpText:
        "Replaces Shopify's chat bubble with a button styled like the rest of your theme. Shopify's own chat window is unchanged — it can't be restyled from the storefront.",
    },
    {
      type: "text",
      label: "Theme button label",
      name: "shopifyChatCustomButtonLabel",
      defaultValue: "",
      placeholder: "Chat with us",
      helpText: "Leave empty for an icon-only button.",
      condition: (theme: { shopifyChatCustomButton: boolean }) =>
        theme.shopifyChatCustomButton === true,
    },
    {
      type: "select",
      label: "Vertical offset",
      name: "shopifyChatVerticalPosition",
      condition: (theme: { shopifyChatCustomButton: boolean }) =>
        theme.shopifyChatCustomButton !== true,
      configs: {
        options: [
          { value: "lowest", label: "Lowest" },
          { value: "higher", label: "Higher" },
          { value: "highest", label: "Highest" },
        ],
      },
      defaultValue: "lowest",
    },
    {
      type: "color",
      label: "Button color",
      name: "shopifyChatColor",
      condition: (theme: { shopifyChatCustomButton: boolean }) =>
        theme.shopifyChatCustomButton !== true,
      defaultValue: "#000000",
    },
    {
      type: "select",
      label: "Button style",
      name: "shopifyChatStyle",
      condition: (theme: { shopifyChatCustomButton: boolean }) =>
        theme.shopifyChatCustomButton !== true,
      configs: {
        options: [
          { value: "icon", label: "Icon only" },
          { value: "text", label: "Icon and text" },
        ],
      },
      defaultValue: "icon",
    },
    {
      type: "select",
      label: "Button icon",
      name: "shopifyChatIcon",
      condition: (theme: { shopifyChatCustomButton: boolean }) =>
        theme.shopifyChatCustomButton !== true,
      configs: {
        options: [
          { value: "chat_bubble", label: "Chat bubble" },
          { value: "speech_bubble", label: "Speech bubble" },
          { value: "text_message", label: "Text message" },
          { value: "agent", label: "Agent" },
          { value: "team", label: "Team" },
          { value: "email", label: "Email" },
          { value: "hand_wave", label: "Hand wave" },
          { value: "lifebuoy", label: "Lifebuoy" },
          { value: "paper_plane", label: "Paper plane" },
          { value: "service_bell", label: "Service bell" },
          { value: "smiley_face", label: "Smiley face" },
          { value: "question_mark", label: "Question mark" },
          { value: "no_icon", label: "No icon" },
        ],
      },
      defaultValue: "chat_bubble",
    },
    {
      type: "select",
      label: "Button text",
      name: "shopifyChatText",
      configs: {
        options: [
          { value: "chat_with_us", label: "Chat with us" },
          { value: "assistance", label: "Assistance" },
          { value: "contact", label: "Contact" },
          { value: "help", label: "Help" },
          { value: "support", label: "Support" },
          { value: "live_chat", label: "Live chat" },
          { value: "message_us", label: "Message us" },
          { value: "need_help", label: "Need help?" },
          { value: "no_text", label: "No text" },
        ],
      },
      defaultValue: "chat_with_us",
      condition: (theme: {
        shopifyChatStyle: string;
        shopifyChatCustomButton: boolean;
      }) =>
        theme.shopifyChatCustomButton !== true &&
        theme.shopifyChatStyle === "text",
    },
  ],
} as const satisfies InspectorGroup;
