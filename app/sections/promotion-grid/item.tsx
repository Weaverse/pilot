import {
  createSchema,
  type HydrogenComponentProps,
  IMAGES_PLACEHOLDERS,
  type WeaverseImage,
} from "@weaverse/hydrogen";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { forwardRef } from "react";
import { BackgroundImage } from "~/components/background-image";
import type { OverlayProps } from "~/components/overlay";
import { Overlay, overlayInputs } from "~/components/overlay";

const variants = cva(
  [
    "promotion-grid-item",
    "group/overlay",
    "relative flex aspect-square flex-col gap-4 overflow-hidden p-4",
    "[&_.paragraph]:mx-[unset]",
  ],
  {
    variants: {
      contentPosition: {
        "top left": "items-start justify-start [&_.paragraph]:text-left",
        "top center": "items-center justify-start [&_.paragraph]:text-center",
        "top right": "items-end justify-start [&_.paragraph]:text-right",
        "center left": "items-start justify-center [&_.paragraph]:text-left",
        "center center":
          "items-center justify-center [&_.paragraph]:text-center",
        "center right": "items-end justify-center [&_.paragraph]:text-right",
        "bottom left": "items-start justify-end [&_.paragraph]:text-left",
        "bottom center": "items-center justify-end [&_.paragraph]:text-center",
        "bottom right": "items-end justify-end [&_.paragraph]:text-right",
      },
      borderRadius: {
        0: "",
        2: "rounded-xs",
        4: "rounded-sm",
        6: "rounded-md",
        8: "rounded-lg",
        10: "rounded-[10px]",
        12: "rounded-xl",
        14: "rounded-[14px]",
        16: "rounded-2xl",
        18: "rounded-[18px]",
        20: "rounded-[20px]",
        22: "rounded-[22px]",
        24: "rounded-3xl",
        26: "rounded-[26px]",
        28: "rounded-[28px]",
        30: "rounded-[30px]",
        32: "rounded-[32px]",
        34: "rounded-[34px]",
        36: "rounded-[36px]",
        38: "rounded-[38px]",
        40: "rounded-[40px]",
      },
    },
  },
);

interface PromotionItemProps
  extends VariantProps<typeof variants>,
    HydrogenComponentProps,
    OverlayProps {
  backgroundImage: WeaverseImage | string;
}

const PromotionGridItem = forwardRef<HTMLDivElement, PromotionItemProps>(
  (props, ref) => {
    const {
      contentPosition,
      backgroundImage,
      borderRadius,
      children,
      enableOverlay,
      overlayColor,
      overlayColorHover,
      overlayOpacity,
      ...rest
    } = props;
    return (
      <div
        ref={ref}
        {...rest}
        data-motion="slide-in"
        className={variants({ contentPosition, borderRadius })}
      >
        <BackgroundImage backgroundImage={backgroundImage} />
        <Overlay
          enableOverlay={enableOverlay}
          overlayColor={overlayColor}
          overlayColorHover={overlayColorHover}
          overlayOpacity={overlayOpacity}
        />
        {children}
      </div>
    );
  },
);

export default PromotionGridItem;

export const schema = createSchema({
  type: "promotion-grid-item",
  title: "Promotion",
  settings: [
    {
      group: "Layout",
      inputs: [
        {
          type: "position",
          label: "Content position",
          name: "contentPosition",
          defaultValue: "center center",
        },
        {
          type: "range",
          name: "borderRadius",
          label: "Border radius",
          configs: {
            min: 0,
            max: 40,
            step: 2,
            unit: "px",
          },
          defaultValue: 0,
        },
      ],
    },
    {
      group: "Background",
      inputs: [
        {
          type: "image",
          name: "backgroundImage",
          label: "Background image",
        },
        {
          type: "heading",
          label: "Overlay",
        },
        ...overlayInputs,
      ],
    },
  ],
  childTypes: ["subheading", "heading", "paragraph", "promotion-item--buttons"],
  presets: {
    contentPosition: "bottom right",
    backgroundImage: IMAGES_PLACEHOLDERS.collection_3,
    enableOverlay: true,
    overlayColor: "#0c0c0c",
    overlayOpacity: 20,
    children: [
      {
        type: "heading",
        content: "Announce your promotion",
      },
      {
        type: "paragraph",
        content:
          "Include the smaller details of your promotion in text below the title.",
      },
      {
        type: "promotion-item--buttons",
        children: [
          {
            type: "button",
            content: "Shop now",
          },
        ],
      },
    ],
  },
});
