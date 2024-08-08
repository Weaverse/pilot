import type { WeaverseImage } from "@weaverse/hydrogen";

export type OptionDisplayType =
  | "dropdown"
  | "button"
  | "color"
  | "variant-image"
  | "custom-image";
export type OptionSize = "sm" | "md" | "lg";
export type OptionShape = "square" | "round" | "circle";

export type OptionData = {
  id: string;
  name: string;
  displayName: string;
  type: OptionDisplayType;
  size: OptionSize;
  shape: OptionShape;
};

export type SwatchesConfigs = {
  options: OptionData[];
  swatches: {
    colors: ColorSwatch[];
    images: ImageSwatch[];
  };
};

export type ColorSwatch = {
  id: string;
  name: string;
  value: string;
};
export type ImageSwatch = {
  id: string;
  name: string;
  value: WeaverseImage | string;
};
