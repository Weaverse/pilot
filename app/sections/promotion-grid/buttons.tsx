import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from "@weaverse/hydrogen";
import type { CSSProperties } from "react";
import { forwardRef } from "react";

interface ButtonItemsProps extends HydrogenComponentProps {
  gap: number;
}

let PromotionItemButtons = forwardRef<HTMLDivElement, ButtonItemsProps>(
  (props, ref) => {
    let { gap, children, ...rest } = props;
    let spacingStyle: CSSProperties = {
      gap: `${gap}px`,
    } as CSSProperties;
    return (
      <div ref={ref} {...rest} className="flex mt-3" style={spacingStyle}>
        {children}
      </div>
    );
  },
);

export default PromotionItemButtons;

export let schema: HydrogenComponentSchema = {
  type: "promotion-item--buttons",
  title: "Buttons",
  inspector: [
    {
      group: "Buttons",
      inputs: [
        {
          type: "range",
          name: "gap",
          label: "Gap",
          defaultValue: 12,
          configs: {
            min: 10,
            max: 30,
            step: 1,
            unit: "px",
          },
        },
      ],
    },
  ],
  childTypes: ["button"],
};
