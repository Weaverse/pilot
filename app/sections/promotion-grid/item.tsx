import {
  createSchema,
  type HydrogenComponentProps,
  IMAGES_PLACEHOLDERS,
  type WeaverseImage,
} from "@weaverse/hydrogen";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { BackgroundImage } from "~/components/background-image";
import type { OverlayProps } from "~/components/overlay";
import { Overlay, overlayInputs } from "~/components/overlay";
import { ScrollReveal } from "~/components/scroll-reveal";
import { cn } from "~/utils/cn";

const variants = cva(
  [
    "promotion-grid-item",
    "group/overlay",
    "relative flex aspect-square flex-col gap-4 overflow-hidden rounded-md p-4",
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
    },
  },
);

interface PromotionItemProps
  extends VariantProps<typeof variants>,
    HydrogenComponentProps,
    OverlayProps {
  backgroundImage: WeaverseImage | string;
}

function PromotionGridItem(props: PromotionItemProps) {
  const {
    contentPosition,
    backgroundImage,
    children,
    enableOverlay,
    overlayColor,
    overlayColorHover,
    overlayOpacity,
    ...rest
  } = props;
  return (
    <ScrollReveal
      animation="slide-in"
      {...rest}
      className={cn(variants({ contentPosition }))}
    >
      <BackgroundImage backgroundImage={backgroundImage} />
      <Overlay
        enableOverlay={enableOverlay}
        overlayColor={overlayColor}
        overlayColorHover={overlayColorHover}
        overlayOpacity={overlayOpacity}
      />
      {children}
    </ScrollReveal>
  );
}

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
