import type { InspectorGroup } from "@weaverse/hydrogen";

export const pwaSettings = {
  group: "Mobile app (PWA)",
  inputs: [
    {
      type: "switch",
      label: "Enable installable app",
      name: "pwaEnabled",
      defaultValue: false,
      helpText:
        "Lets shoppers add your store to their phone's home screen as an app (Android shows an install prompt, iOS installs via Share → Add to Home Screen).",
    },
    {
      type: "text",
      label: "App name",
      name: "pwaName",
      defaultValue: "",
      helpText: "Shown under the app icon. Leave empty to use your store name.",
      condition: (theme: { pwaEnabled: boolean }) => theme.pwaEnabled === true,
    },
    {
      type: "text",
      label: "Short name",
      name: "pwaShortName",
      defaultValue: "",
      helpText:
        "Max ~12 characters, used where space is limited. Falls back to app name.",
      condition: (theme: { pwaEnabled: boolean }) => theme.pwaEnabled === true,
    },
    {
      type: "image",
      label: "App icon",
      name: "pwaIcon",
      helpText:
        "Square PNG, at least 512×512. Falls back to your Shopify brand logo if empty — a dedicated square icon looks much better on a home screen.",
      condition: (theme: { pwaEnabled: boolean }) => theme.pwaEnabled === true,
    },
    {
      type: "color",
      label: "Theme color",
      name: "pwaThemeColor",
      defaultValue: "#ffffff",
      helpText: "Colors the status bar / window chrome of the installed app.",
      condition: (theme: { pwaEnabled: boolean }) => theme.pwaEnabled === true,
    },
    {
      type: "color",
      label: "Splash background",
      name: "pwaBackgroundColor",
      defaultValue: "#ffffff",
      condition: (theme: { pwaEnabled: boolean }) => theme.pwaEnabled === true,
    },
    {
      type: "switch",
      label: "Show iOS install hint",
      name: "pwaIosHint",
      defaultValue: true,
      helpText:
        "One-time dismissible banner for iPhone Safari visitors explaining Add to Home Screen (iOS never shows an install prompt on its own).",
      condition: (theme: { pwaEnabled: boolean }) => theme.pwaEnabled === true,
    },
  ],
} as const satisfies InspectorGroup;
