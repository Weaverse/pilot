import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import {forwardRef} from 'react';

interface ActionsProps extends HydrogenComponentProps<{image: string}> {}

let Actions = forwardRef<HTMLDivElement, ActionsProps>((props, ref) => {
  let {data, children, ...rest} = props;
  return (
    <div ref={ref} {...rest} className="flex justify-center space-x-4">
      {children}
    </div>
  );
});

export default Actions;

export let schema: HydrogenComponentSchema = {
  type: 'image-with-text--actions',
  title: 'Actions',
  inspector: {
    settings: [],
    styles: [],
  },
  toolbar: ['general-settings', ['duplicate', 'delete']],
};