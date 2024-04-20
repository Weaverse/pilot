import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import type {CSSProperties} from 'react';
import {forwardRef} from 'react';

interface ActionsProps extends HydrogenComponentProps {
  gap: number;
}

let Actions = forwardRef<HTMLDivElement, ActionsProps>((props, ref) => {
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

export default Actions;

export let schema: HydrogenComponentSchema = {
  type: 'countdown--actions',
  title: 'Actions',
  toolbar: ['general-settings', ['duplicate', 'delete']],
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
