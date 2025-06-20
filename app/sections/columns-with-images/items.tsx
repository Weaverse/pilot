import {
  createSchema,
  type HydrogenComponentProps,
  IMAGES_PLACEHOLDERS,
} from "@weaverse/hydrogen";
import { forwardRef } from "react";

interface ColumnsWithImagesItemsProps extends HydrogenComponentProps {
  gap: number;
}

const ColumnsWithImagesItems = forwardRef<
  HTMLDivElement,
  ColumnsWithImagesItemsProps
>((props, ref) => {
  const { children, gap, ...rest } = props;

  return (
    <div
      ref={ref}
      {...rest}
      className="flex flex-col sm:grid sm:grid-cols-12"
      style={{ gap: `${gap}px` }}
    >
      {children}
    </div>
  );
});

export default ColumnsWithImagesItems;

export const schema = createSchema({
  type: "columns-with-images--items",
  title: "Items",
  settings: [
    {
      group: "Items",
      inputs: [
        {
          type: "range",
          label: "Items gap",
          name: "gap",
          configs: {
            min: 16,
            max: 80,
            step: 4,
            unit: "px",
          },
          defaultValue: 40,
        },
      ],
    },
  ],
  childTypes: ["column-with-image--item"],
  presets: {
    children: [
      {
        type: "column-with-image--item",
        imageSrc: IMAGES_PLACEHOLDERS.product_1,
      },
      {
        type: "column-with-image--item",
        imageSrc: IMAGES_PLACEHOLDERS.product_2,
      },
      {
        type: "column-with-image--item",
        imageSrc: IMAGES_PLACEHOLDERS.product_3,
      },
    ],
  },
});
