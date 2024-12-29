import { Image as HydrogenImage } from "@shopify/hydrogen";
import type { Image as ImageType } from "@shopify/hydrogen/storefront-api-types";
import { useState } from "react";
import { cn } from "~/utils/cn";

type Crop = "center" | "top" | "bottom" | "left" | "right";

export interface ImageProps extends React.ComponentPropsWithRef<"img"> {
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

export function Image(props: ImageProps) {
  let { className, ...rest } = props;
  let [loaded, setLoaded] = useState(false);

  return (
    <div
      className={cn(
        "w-full h-full overflow-hidden",
        !loaded && "animate-pulse [animation-duration:4s]",
        className,
      )}
    >
      <HydrogenImage
        className={cn(
          "[transition:filter_500ms_cubic-bezier(.4,0,.2,1)]",
          "h-full max-h-full w-full object-cover object-center",
          loaded ? "blur-0" : "blur-xl",
        )}
        onLoad={() => setLoaded(true)}
        {...rest}
      />
    </div>
  );
}
