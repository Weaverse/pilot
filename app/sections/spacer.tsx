import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from "@weaverse/hydrogen";
import { forwardRef } from "react";

type SpacerProps = HydrogenComponentProps & {
  mobileHeight: number;
  desktopHeight: number;
  backgroundColor: string;
  addSeparator: boolean;
  separatorColor: string;
};

let Spacer = forwardRef<HTMLDivElement, SpacerProps>((props, ref) => {
  let {
    mobileHeight,
    desktopHeight,
    backgroundColor,
    addSeparator,
    separatorColor,
    ...rest
  } = props;
  return (
    <div
      ref={ref}
      {...rest}
      className="w-full flex items-center justify-center h-[var(--mobile-height)] md:h-[var(--desktop-height)]"
      style={
        {
          backgroundColor,
          "--mobile-height": `${mobileHeight}px`,
          "--desktop-height": `${desktopHeight}px`,
          "--separator-color": separatorColor,
        } as React.CSSProperties
      }
    >
      {addSeparator && (
        <div className="w-3/4 md:w-2/3 mx-auto border-t h-px border-[var(--separator-color,var(--color-border))]" />
      )}
    </div>
  );
});

export default Spacer;

export let schema: HydrogenComponentSchema = {
  type: "spacer",
  title: "Spacer",
  inspector: [
    {
      group: "Spacer",
      inputs: [
        {
          type: "range",
          label: "Mobile height",
          name: "mobileHeight",
          configs: {
            min: 0,
            max: 200,
            step: 1,
            unit: "px",
          },
          defaultValue: 50,
          helpText: "Set to 0 to hide the Spacer on mobile devices",
        },
        {
          type: "range",
          label: "Desktop height",
          name: "desktopHeight",
          configs: {
            min: 0,
            max: 300,
            step: 1,
            unit: "px",
          },
          defaultValue: 100,
        },
        {
          type: "color",
          label: "Background color",
          name: "backgroundColor",
          defaultValue: "#00000000",
        },
        {
          type: "switch",
          label: "Add border separator",
          name: "addSeparator",
          defaultValue: false,
        },
        {
          type: "color",
          label: "Separator color",
          name: "separatorColor",
          defaultValue: "#000",
          condition: "addSeparator.eq.true",
        },
      ],
    },
  ],
};
