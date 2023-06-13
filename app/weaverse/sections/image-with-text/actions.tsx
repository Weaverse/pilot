import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import {forwardRef} from 'react';

interface ImageWithTextActionsProps extends HydrogenComponentProps {}

let Actions = forwardRef<HTMLDivElement, ImageWithTextActionsProps>(
  (props, ref) => {
    let {children, ...rest} = props;
    return (
      <div ref={ref} {...rest} className="flex justify-center space-x-4">
        {children}
      </div>
    );
  },
);

export default Actions;

export let schema: HydrogenComponentSchema = {
  type: 'image-with-text--actions',
  title: 'Actions',
  childTypes: ['button'],
  inspector: [],
  toolbar: ['general-settings', ['duplicate', 'delete']],
  presets: {
    children: [{type: 'button'}, {type: 'button'}],
  },
};
