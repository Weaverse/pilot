import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import type {CSSProperties} from 'react';
import {forwardRef} from 'react';

interface PromotionProps extends HydrogenComponentProps {
  gap: number;
  topPadding: number;
  bottomPadding: number;
}

let PromotionGrid = forwardRef<HTMLElement, PromotionProps>((props, ref) => {
  let {gap, topPadding, bottomPadding, children, ...rest} = props;
  let spacingStyle: CSSProperties = {
    gap: `${gap}px`,
    paddingTop: `${topPadding}px`,
    paddingBottom: `${bottomPadding}px`,
  } as CSSProperties;
  return (
    <section ref={ref} {...rest} className="w-full h-full">
      <div className="px-12 sm-max:px-6">
        <div className="flex flex-wrap justify-center" style={spacingStyle}>
          {children}
        </div>
      </div>
    </section>
  );
});

export default PromotionGrid;

export let schema: HydrogenComponentSchema = {
  type: 'promotion-grid',
  title: 'Promotion grid',
  toolbar: ['general-settings', ['duplicate', 'delete']],
  inspector: [
    {
      group: 'Promotion',
      inputs: [
        {
          type: 'range',
          name: 'gap',
          label: 'Gap',
          defaultValue: 30,
          configs: {
            min: 20,
            max: 50,
            step: 10,
            unit: 'px',
          },
        },
        {
          type: 'range',
          name: 'topPadding',
          label: 'Top padding',
          defaultValue: 40,
          configs: {
            min: 10,
            max: 100,
            step: 10,
            unit: 'px',
          },
        },
        {
          type: 'range',
          name: 'bottomPadding',
          label: 'Bottom padding',
          defaultValue: 40,
          configs: {
            min: 10,
            max: 100,
            step: 10,
            unit: 'px',
          },
        },
      ],
    },
  ],
  childTypes: ['promotion-item'],
  presets: {
    children: [
      {
        type: 'promotion-item',
      },
    ],
  },
};
