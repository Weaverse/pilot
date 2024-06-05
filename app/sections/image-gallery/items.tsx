import {
  IMAGES_PLACEHOLDERS,
  type HydrogenComponentProps,
  type HydrogenComponentSchema,
} from "@weaverse/hydrogen";
import { forwardRef } from "react";

type ImageGalleyItemsProps = HydrogenComponentProps & {
  gap: number;
};

let ImageGalleyItems = forwardRef<HTMLDivElement, ImageGalleyItemsProps>(
  (props, ref) => {
    let { children, gap, ...rest } = props;

    return (
      <div
        ref={ref}
        {...rest}
        className="flex flex-col sm:grid sm:grid-cols-4"
        style={{ gap: `${gap}px` }}
      >
        {children}
      </div>
    );
  },
);

export default ImageGalleyItems;

export let schema: HydrogenComponentSchema = {
  type: "image-gallery--items",
  title: "Images",
  inspector: [
    {
      group: "Images",
      inputs: [
        {
          type: "range",
          label: "Images gap",
          name: "gap",
          configs: {
            min: 16,
            max: 40,
            step: 6,
            unit: "px",
          },
          defaultValue: 16,
        },
      ],
    },
  ],
  childTypes: ["image-gallery--item"],
  toolbar: ["general-settings", ["duplicate", "delete"]],
  presets: {
    children: [
      {
        type: "image-gallery--item",
        columnSpan: 2,
        src: IMAGES_PLACEHOLDERS.image,
      },
      {
        type: "image-gallery--item",
        hideOnMobile: true,
        src: IMAGES_PLACEHOLDERS.image,
      },
      {
        type: "image-gallery--item",
        hideOnMobile: true,
        src: IMAGES_PLACEHOLDERS.image,
      },
      {
        type: "image-gallery--item",
        hideOnMobile: true,
        src: IMAGES_PLACEHOLDERS.image,
      },
      {
        type: "image-gallery--item",
        hideOnMobile: true,
        src: IMAGES_PLACEHOLDERS.image,
      },
      {
        type: "image-gallery--item",
        columnSpan: 2,
        src: IMAGES_PLACEHOLDERS.image,
      },
    ],
  },
};
