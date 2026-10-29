import type { Image as ImageType } from "@shopify/hydrogen/storefront-api-types";
import type { ComponentPropsWithRef } from "react";

/**
 * Local port of classic hydrogen-react's `<Image>` (removed in Hydrogen
 * 2026.10, which ships no image component). Same props, same `src`/`srcSet`/
 * `sizes`/`width`/`height`/`aspect-ratio` output, so markup and CDN requests
 * stay identical to `main`. Most callers want the `Image` wrapper from
 * `~/components/image` (loading blur, focal point); use this one where the raw
 * `<img>` was rendered before (logos, backgrounds, swatches).
 */

export type Crop = "center" | "top" | "bottom" | "left" | "right";

export type LoaderParams = {
  /** The base URL of the image */
  src?: ImageType["url"];
  /** The URL param that controls width */
  width?: number;
  /** The URL param that controls height */
  height?: number;
  /** The URL param that controls the cropping region */
  crop?: Crop;
};

export type Loader = (params: LoaderParams) => string;

export type SrcSetOptions = {
  /** The number of sizes to generate */
  intervals: number;
  /** The smallest image size */
  startingWidth: number;
  /** The increment by which to increase for each size, in pixels */
  incrementSize: number;
  /** The size used for placeholder fallback images */
  placeholderWidth: number;
};

export type ShopifyImageProps = ComponentPropsWithRef<"img"> & {
  /** The aspect ratio of the image, in the format of `width/height`. */
  aspectRatio?: string;
  /** The crop position of the image. Defaults to `center`. */
  crop?: Crop;
  /** A Storefront API `Image` (`url`, `altText`, `width`, `height`). */
  data?: {
    url?: string | null;
    altText?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
  /** Builds the URL for each size. Defaults to the Shopify CDN loader. */
  loader?: Loader;
  /** Changes the default srcSet generation. */
  srcSetOptions?: SrcSetOptions;
};

const DEFAULT_SRC_SET_OPTIONS: SrcSetOptions = {
  intervals: 15,
  startingWidth: 200,
  incrementSize: 200,
  placeholderWidth: 100,
};

type NormalizedProps = {
  width: string;
  height: string;
  src: string | undefined;
  alt: string;
  aspectRatio: string | undefined;
};

export function ShopifyImage({
  alt,
  aspectRatio,
  crop = "center",
  data,
  decoding = "async",
  height = "auto",
  loader = shopifyLoader,
  loading = "lazy",
  sizes,
  src,
  srcSetOptions = DEFAULT_SRC_SET_OPTIONS,
  width = "100%",
  ref,
  ...passthroughProps
}: ShopifyImageProps) {
  let dataWidth = data?.width && data?.height ? data.width : undefined;
  let dataHeight = data?.width && data?.height ? data.height : undefined;
  let dataUnitsMatch = Boolean(unitsMatch(dataWidth, dataHeight));

  let widthParts = getUnitValueParts((width || "100%").toString());
  let autoHeight = height === undefined || height === null;
  let heightParts = autoHeight ? null : getUnitValueParts(height.toString());
  let nSrc = src || data?.url || undefined;
  if (!nSrc && import.meta.env.DEV) {
    console.warn("No src or data.url provided to Image component.");
  }
  let normalizedProps: NormalizedProps = {
    width: `${widthParts.number}${widthParts.unit}`,
    height: heightParts ? `${heightParts.number}${heightParts.unit}` : "auto",
    src: nSrc,
    alt: data?.altText && !alt ? data.altText : alt || "",
    aspectRatio: aspectRatio
      ? aspectRatio
      : dataUnitsMatch
        ? [
            getNormalizedFixedUnit(dataWidth),
            getNormalizedFixedUnit(dataHeight),
          ].join("/")
        : undefined,
  };

  let { intervals, startingWidth, incrementSize, placeholderWidth } =
    srcSetOptions;
  let imageWidths = generateImageWidths(
    width,
    intervals,
    startingWidth,
    incrementSize,
  );
  let sourceDimensions = {
    width: data?.width ?? undefined,
    height: data?.height ?? undefined,
  };
  let fixedWidth = isFixedWidth(normalizedProps.width);
  if (!(sizes || fixedWidth) && import.meta.env.DEV) {
    console.warn(
      [
        "No sizes prop provided to Image component,",
        "you may be loading unnecessarily large images.",
        `Image used is ${src || data?.url || "unknown"}`,
      ].join(" "),
    );
  }

  if (fixedWidth) {
    let intWidth = getNormalizedFixedUnit(width);
    let intHeight = getNormalizedFixedUnit(height);
    let fixedAspectRatio = aspectRatio
      ? aspectRatio
      : unitsMatch(normalizedProps.width, normalizedProps.height)
        ? [intWidth, intHeight].join("/")
        : normalizedProps.aspectRatio
          ? normalizedProps.aspectRatio
          : undefined;
    let sizesArray = generateSizes(
      imageWidths,
      fixedAspectRatio,
      crop,
      sourceDimensions,
    );
    let fixedHeight = intHeight
      ? intHeight
      : fixedAspectRatio && intWidth
        ? intWidth * (parseAspectRatio(fixedAspectRatio) ?? 1)
        : undefined;
    // Prop order matches classic: a caller's `style` replaces the computed
    // aspect ratio on fixed-width images.
    return (
      <img
        ref={ref}
        alt={normalizedProps.alt}
        decoding={decoding}
        height={fixedHeight}
        loading={loading}
        src={loader({
          src: normalizedProps.src,
          width: intWidth,
          height: fixedHeight,
          crop: normalizedProps.height === "auto" ? undefined : crop,
        })}
        srcSet={generateSrcSet(
          normalizedProps.src,
          sizesArray,
          loader,
          "density",
        )}
        width={intWidth}
        style={{ aspectRatio: fixedAspectRatio, ...passthroughProps.style }}
        {...passthroughProps}
      />
    );
  }

  let sizesArray = generateSizes(
    imageWidths,
    normalizedProps.aspectRatio,
    crop,
    sourceDimensions,
  );
  let placeholderHeight =
    normalizedProps.aspectRatio && placeholderWidth
      ? placeholderWidth * (parseAspectRatio(normalizedProps.aspectRatio) ?? 1)
      : undefined;
  return (
    <img
      ref={ref}
      alt={normalizedProps.alt}
      decoding={decoding}
      height={placeholderHeight}
      loading={loading}
      sizes={sizes}
      src={loader({
        src: normalizedProps.src,
        width: placeholderWidth,
        height: placeholderHeight,
        crop,
      })}
      srcSet={generateSrcSet(normalizedProps.src, sizesArray, loader)}
      width={placeholderWidth}
      {...passthroughProps}
      style={{
        width: normalizedProps.width,
        aspectRatio: normalizedProps.aspectRatio,
        ...passthroughProps.style,
      }}
    />
  );
}

const PLACEHOLDER_DOMAIN = "https://placeholder.shopify.com";

/** Appends Shopify CDN `width`/`height`/`crop` params to an image URL. */
export function shopifyLoader({ src, width, height, crop }: LoaderParams) {
  if (!src) {
    return "";
  }
  let url = new URL(src, PLACEHOLDER_DOMAIN);
  if (width) {
    url.searchParams.append("width", Math.round(width).toString());
  }
  if (height) {
    url.searchParams.append("height", Math.round(height).toString());
  }
  if (crop) {
    url.searchParams.append("crop", crop);
  }
  return url.href.replace(PLACEHOLDER_DOMAIN, "");
}

function unitsMatch(
  width: string | number = "100%",
  height: string | number = "auto",
) {
  return (
    getUnitValueParts(width.toString()).unit ===
    getUnitValueParts(height.toString()).unit
  );
}

function getUnitValueParts(value: string) {
  let unit = value.replace(/[0-9.]/g, "");
  let number = Number.parseFloat(value.replace(unit, ""));
  return { unit: unit === "" ? "px" : unit, number };
}

function getNormalizedFixedUnit(value?: string | number) {
  if (value === undefined) {
    return;
  }
  let { unit, number } = getUnitValueParts(value.toString());
  switch (unit) {
    case "em":
    case "rem":
      return number * 16;
    case "px":
    case "":
      return number;
    default:
      return;
  }
}

function isFixedWidth(width: string | number) {
  return typeof width === "number" || /\d(px|em|rem)$/.test(width);
}

function generateSrcSet(
  src: string | undefined,
  sizesArray: { width?: number; height?: number; crop?: Crop }[] | undefined,
  loader: Loader = shopifyLoader,
  descriptorType: "width" | "density" = "width",
) {
  if (!src) {
    return "";
  }
  if (!sizesArray || sizesArray.length === 0) {
    return src;
  }
  return sizesArray
    .map(
      (size, i) =>
        `${loader({ src, width: size.width, height: size.height, crop: size.crop })} ${
          descriptorType === "density" ? `${i + 1}x` : `${size.width ?? 0}w`
        }`,
    )
    .join(", ");
}

function generateImageWidths(
  width: string | number = "100%",
  intervals: number,
  startingWidth: number,
  incrementSize: number,
) {
  if (isFixedWidth(width)) {
    return Array.from(
      { length: 3 },
      (_, i) => (i + 1) * (getNormalizedFixedUnit(width) ?? 0),
    );
  }
  return Array.from(
    { length: intervals },
    (_, i) => i * incrementSize + startingWidth,
  );
}

/** `"4/5"` → `1.25` (height per unit of width). */
function parseAspectRatio(aspectRatio?: string) {
  if (!aspectRatio) {
    return;
  }
  let [width, height] = aspectRatio.split("/");
  return 1 / (Number(width) / Number(height));
}

function generateSizes(
  imageWidths: number[],
  aspectRatio: string | undefined,
  crop: Crop = "center",
  sourceDimensions?: { width?: number; height?: number },
) {
  return imageWidths
    .map((width) => ({
      width,
      height: aspectRatio
        ? width * (parseAspectRatio(aspectRatio) ?? 1)
        : undefined,
      crop,
    }))
    .filter(({ width, height }) => {
      if (sourceDimensions?.width && width > sourceDimensions.width) {
        return false;
      }
      if (
        sourceDimensions?.height &&
        height &&
        height > sourceDimensions.height
      ) {
        return false;
      }
      return true;
    });
}
