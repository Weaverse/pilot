import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import {forwardRef, CSSProperties} from 'react';

interface ButtonItemsProps extends HydrogenComponentProps {
  gap: number;
}

let ButtonItems = forwardRef<HTMLDivElement, ButtonItemsProps>((props, ref) => {
  let {gap, children, ...rest} = props;
  let spacingStyle: CSSProperties = {
    gap: `${gap}px`,
  } as CSSProperties;
  return (
    <div ref={ref} {...rest} className="flex mt-3" style={spacingStyle}>
      {children}
    </div>
  );
});

export default ButtonItems;

export let schema: HydrogenComponentSchema = {
  type: 'promotion-buttons',
  title: 'Buttons',
  inspector: [
    {
      group: 'Buttons',
      inputs: [
        {
          type: 'range',
          name: 'gap',
          label: 'Gap',
          defaultValue: 12,
          configs: {
            min: 10,
            max: 30,
            step: 1,
            unit: 'px',
          },
        },
      ],
    },
  ],
  childTypes: ['button'],
  presets: {
    children: [
      {
        type: 'button',
        content: 'Button',
      },
      {
        type: 'button',
        content: 'Button',
      },
    ],
  },
};
