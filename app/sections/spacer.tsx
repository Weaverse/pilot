import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";
import { forwardRef } from "react";

interface SpacerData {
  mobileHeight: number;
  desktopHeight: number;
  backgroundColor: string;
  addSeparator: boolean;
  separatorColor: string;
}

const Spacer = forwardRef<HTMLDivElement, SpacerData & HydrogenComponentProps>(
  (props, ref) => {
    const {
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
        className="flex h-(--mobile-height) w-full items-center justify-center md:h-(--desktop-height)"
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
          <div className="mx-auto h-px w-3/4 border-(--separator-color,var(--color-border)) border-t md:w-2/3" />
        )}
      </div>
    );
  },
);

export default Spacer;

export const schema = createSchema({
  type: "spacer",
  title: "Spacer",
  settings: [
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
          condition: (data: SpacerData) => data.addSeparator,
        },
      ],
    },
  ],
});
