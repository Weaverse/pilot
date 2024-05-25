import { Image } from "@shopify/hydrogen";
import type {
  InspectorGroup,
  PositionInputValue,
  WeaverseImage,
} from "@weaverse/hydrogen";
import type { CSSProperties } from "react";

export type BackgroundImageProps = {
  backgroundImage?: WeaverseImage | string;
  backgroundFit?: CSSProperties["objectFit"];
  backgroundPosition?: PositionInputValue;
};

export function BackgroundImage(props: BackgroundImageProps) {
  let { backgroundImage, backgroundFit, backgroundPosition } = props;
  if (backgroundImage) {
    let data =
      typeof backgroundImage === "string"
        ? { url: backgroundImage, altText: "Section background" }
        : backgroundImage;
    return (
      <Image
        className="absolute inset-0 w-full h-full z-[-1]"
        data={data}
        sizes="auto"
        style={{
          objectFit: backgroundFit,
          objectPosition: backgroundPosition,
        }}
      />
    );
  }
  return null;
}

export let backgroundInputs: InspectorGroup["inputs"] = [
  {
    type: "select",
    name: "backgroundFor",
    label: "Background for",
    configs: {
      options: [
        { value: "section", label: "Section" },
        { value: "content", label: "Content" },
      ],
    },
    defaultValue: "section",
  },
  {
    type: "color",
    name: "backgroundColor",
    label: "Background color",
    defaultValue: "",
  },
  {
    type: "image",
    name: "backgroundImage",
    label: "Background image",
  },
  {
    type: "select",
    name: "backgroundFit",
    label: "Background fit",
    configs: {
      options: [
        { value: "fill", label: "Fill" },
        { value: "cover", label: "Cover" },
        { value: "contain", label: "Contain" },
      ],
    },
    defaultValue: "cover",
    condition: "backgroundImage.ne.nil",
  },
  {
    type: "position",
    name: "backgroundPosition",
    label: "Background position",
    defaultValue: "center",
    condition: "backgroundImage.ne.nil",
  },
];
