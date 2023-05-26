import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import {forwardRef} from 'react';

type ActionsData = {
  image: string;
};

let Actions = forwardRef<HTMLDivElement, HydrogenComponentProps<ActionsData>>(
  (props, ref) => {
    let {data, children, ...rest} = props;
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

export let template: any = {
  type: 'image-with-text--actions',
  children: [
    {
      type: 'button',
      data: {
        text: 'Button',
      },
    },
    {
      type: 'button',
      data: {
        text: 'Button 2',
      },
    },
  ],
};
