import type { ComponentProps } from "react";
import type { IconName } from "./icons/name";

export type { IconName } from "./icons/name";

export type IconProps = {
  name: IconName;
  /** Pixel size for both width and height. Defaults to `1em` (font-size). */
  size?: number | string;
} & ComponentProps<"svg">;

/**
 * Renders a phosphor icon from the inlined SVG sprite via a same-document
 * `<use href="#name">`. The sprite itself is injected once by `<IconSprite>`
 * (in the root layout). Zero per-icon JS — the whole set ships as one sprite.
 */
export function Icon({ name, size, ...props }: IconProps) {
  return (
    <svg
      width={size ?? "1em"}
      height={size ?? "1em"}
      fill="currentColor"
      aria-hidden={props["aria-label"] ? undefined : true}
      {...props}
    >
      <use href={`#${name}`} />
    </svg>
  );
}
