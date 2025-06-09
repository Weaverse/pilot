import type { InspectorGroup } from "@weaverse/hydrogen";
import type { CSSProperties } from "react";
import { cn } from "~/utils/cn";

export type OverlayProps = {
  enableOverlay: boolean;
  overlayColor: string;
  overlayColorHover: string;
  overlayOpacity: number;
  className?: string;
};

export function Overlay(props: OverlayProps) {
  let {
    enableOverlay,
    overlayColor,
    overlayColorHover,
    overlayOpacity,
    className,
  } = props;
  if (enableOverlay) {
    return (
      <div
        className={cn(
          "absolute inset-0 z-[-1] transition-colors duration-300",
          "bg-(--overlay-color)",
          "group-hover/overlay:bg-(--overlay-color-hover,var(--overlay-color))",
          className,
        )}
        style={
          {
            "--overlay-color": overlayColor,
            "--overlay-color-hover": overlayColorHover,
            opacity: overlayOpacity / 100,
            margin: 0,
          } as CSSProperties
        }
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
    condition: (data) => data.enableOverlay,
  },
  {
    type: "color",
    name: "overlayColorHover",
    label: "Overlay color (hover)",
    condition: (data) => data.enableOverlay,
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
    condition: (data) => data.enableOverlay,
  },
];
