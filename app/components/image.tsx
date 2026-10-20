import { Image as HydrogenImage } from "@shopify/hydrogen";
import type { Image as ImageType } from "@shopify/hydrogen/storefront-api-types";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { cn } from "~/utils/cn";
import { getFocalPointPosition } from "~/utils/image";

type Crop = "center" | "top" | "bottom" | "left" | "right";

export interface ImageProps extends Omit<
  React.ComponentPropsWithRef<"img">,
  "ref"
> {
  aspectRatio?: string;
  crop?: "center" | "top" | "bottom" | "left" | "right";
  data?: Partial<
    ImageType & {
      recurseIntoArrays: true;
    }
  >;
  loader?: (params: {
    src?: ImageType["url"];
    width?: number;
    height?: number;
    crop?: Crop;
  }) => string;
  srcSetOptions?: {
    intervals: number;
    startingWidth: number;
    incrementSize: number;
    placeholderWidth: number;
  };
}

export function Image({ className, onLoad, style, ...rest }: ImageProps) {
  /**
   * Use useRef for HydrogenImage, so we can access the HydrogenImage's ref
   * even when using ref prop for the outer div
   */
  const hydrogenImageRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  // A Weaverse image's focal point overrides the default centering unless the
  // caller sets an explicit position. Hydrogen's Image spreads a caller's
  // `style` key (even `undefined`) over the aspect ratio it computes, so the
  // key is only passed when there is a style to apply.
  const objectPosition =
    style?.objectPosition ?? getFocalPointPosition(rest.data);
  const styleProps =
    style || objectPosition ? { style: { ...style, objectPosition } } : {};

  useEffect(() => {
    if (hydrogenImageRef.current?.complete) {
      setLoaded(true);
      onLoad?.({} as React.SyntheticEvent<HTMLImageElement>);
    }
  }, [onLoad]);

  return (
    <div
      className={cn(
        "h-full w-full overflow-hidden rounded-md",
        !loaded && "animate-pulse [animation-duration:4s]",
        className,
      )}
    >
      <HydrogenImage
        ref={hydrogenImageRef}
        className={cn(
          "[transition:filter_500ms_cubic-bezier(.4,0,.2,1)]",
          "h-full max-h-full w-full object-cover object-center",
          loaded ? "blur-0" : "blur-xl",
        )}
        onLoad={(e) => {
          setLoaded(true);
          onLoad?.(e);
        }}
        {...styleProps}
        {...rest}
      />
    </div>
  );
}
