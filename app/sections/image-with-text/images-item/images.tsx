import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import { forwardRef } from 'react';

interface ImagesProps extends HydrogenComponentProps {

}

let ImageComponent = forwardRef<HTMLDivElement, ImagesProps>((props, ref) => {
  let {children, ...rest } = props;
  return (
    <div ref={ref} {...rest} className='w-3/5 flex h-full py-12 justify-end sm-max:order-first sm-max:w-full sm-max:py-10 sm-max:pb-0 sm-max:justify-center'>
      <div className='z-10 h-full sm:translate-x-8 sm:translate-y-8 sm-max:z-10 sm-max:translate-x-9 sm-max:translate-y-9'>
        {children?.map((child, index) => {
          if (index === 1) {
            return (
              child
            );
          }
        })}
      </div>
        {children?.map((child, index) => {
          if (index === 0) {
            return (
              child
            );
          }
        })}
    </div>
  );
});

export default ImageComponent;

export let schema: HydrogenComponentSchema = {
  type: 'Image--Component',
  title: 'Images',
  limit: 1,
  inspector: [
    {
    group: 'Image',
    inputs: [],
    },
  ],
  childTypes: ['Image--Item'],
  presets: {
    children: [
      {
        type: 'Image--Item',
      },
    ],
  },
};
