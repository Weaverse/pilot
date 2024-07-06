import type { BackgroundImageProps } from "./BackgroundImage";
import { BackgroundImage } from "./BackgroundImage";
import type { OverlayProps } from "./Overlay";
import { Overlay } from "./Overlay";

export interface OverlayAndBackgroundProps
  extends BackgroundImageProps,
    OverlayProps {}

export function OverlayAndBackground(props: OverlayAndBackgroundProps) {
  let {
    backgroundImage,
    backgroundFit,
    backgroundPosition,
    enableOverlay,
    overlayColor,
    overlayColorHover,
    overlayOpacity,
  } = props;
  return (
    <>
      <BackgroundImage
        backgroundImage={backgroundImage}
        backgroundFit={backgroundFit}
        backgroundPosition={backgroundPosition}
      />
      <Overlay
        enableOverlay={enableOverlay}
        overlayColor={overlayColor}
        overlayColorHover={overlayColorHover}
        overlayOpacity={overlayOpacity}
      />
    </>
  );
}
