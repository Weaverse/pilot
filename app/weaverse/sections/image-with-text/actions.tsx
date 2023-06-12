import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
  HydrogenComponentTemplate,
} from '@weaverse/hydrogen';
import {forwardRef} from 'react';

type ActionsData = {
  image: string;
};

let Actions = forwardRef<HTMLDivElement, HydrogenComponentProps<ActionsData>>(
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
  inspector: {
    settings: [],
    styles: [],
  },
  toolbar: ['general-settings', ['duplicate', 'delete']],
};

export let template: HydrogenComponentTemplate = {
  type: 'image-with-text--actions',
  children: [
    {
      type: 'button',
      text: 'Button',
    },
    {
      type: 'button',
      text: 'Button 2',
    },
  ],
};
