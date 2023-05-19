import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import React from 'react';
import {forwardRef} from 'react';

export interface TextProps extends HydrogenComponentProps {
  tagName: string;
  className?: string;
  value: string;
}

let Text = forwardRef<HTMLElement, TextProps>((props, ref) => {
  let {tagName, value, ...rest} = props;
  return React.createElement(tagName, {ref, ...rest}, value);
});

Text.defaultProps = {
  tagName: 'h1',
  value: 'The quick brown fox jumps over the lazy dog',
  className: 'title-font sm:text-4xl text-3xl mb-4 font-medium text-gray-900',
};

export let schema: HydrogenComponentSchema = {
  type: 'text',
  title: 'Text',
  inspector: {
    settings: [],
    styles: [],
  },
  toolbar: ['general-settings', ['duplicate', 'delete']],
};

export default Text;
