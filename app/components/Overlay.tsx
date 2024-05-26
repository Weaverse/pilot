import type { InspectorGroup } from "@weaverse/hydrogen";

export type OverlayProps = {
  enableOverlay: boolean;
  overlayColor: string;
  overlayOpacity: number;
};

export function Overlay(props: OverlayProps) {
  let { enableOverlay, overlayColor, overlayOpacity } = props;
  if (enableOverlay && overlayColor) {
    return (
      <div
        className="absolute inset-0 z-[-1]"
        style={{
          backgroundColor: overlayColor,
          opacity: (overlayOpacity || 100) / 100,
          margin: 0,
        }}
      />
    );
  }
  return null;
}

export let overlayInputs: InspectorGroup["inputs"] = [
  {
    type: "switch",
    name: "enableOverlay",
    label: "Enable overlay",
    defaultValue: false,
  },
  {
    type: "color",
    name: "overlayColor",
    label: "Overlay color",
    defaultValue: "#000000",
    condition: "enableOverlay.eq.true",
  },
  {
    type: "range",
    name: "overlayOpacity",
    label: "Overlay opacity",
    defaultValue: 50,
    configs: {
      min: 0,
      max: 100,
      step: 1,
      unit: "%",
    },
    condition: "enableOverlay.eq.true",
  },
];
