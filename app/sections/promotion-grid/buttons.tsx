import {
  createSchema,
  type WeaverseComponentProps,
} from "@weaverse/hydrogen/react-router";

interface ButtonItemsProps extends WeaverseComponentProps {
  gap: number;
}

function PromotionItemButtons(props: ButtonItemsProps) {
  const { gap, children, ...rest } = props;
  return (
    <div {...rest} className="mt-3 flex" style={{ gap: `${gap}px` }}>
      {children}
    </div>
  );
}

export default PromotionItemButtons;

export const schema = createSchema({
  type: "promotion-item--buttons",
  title: "Buttons",
  settings: [
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
});
