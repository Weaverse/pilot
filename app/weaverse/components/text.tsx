import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import React from 'react';
import {forwardRef} from 'react';

export interface TextProps extends HydrogenComponentProps {
  tagName: string;
  className?: string;
  text: string;
}

let Text = forwardRef<HTMLElement, TextProps>((props, ref) => {
  console.log('👉 --------> - props:', props)
  let {text, tagName, ...rest} = props;
  return React.createElement(tagName, {ref, ...rest}, text);
});

Text.defaultProps = {
  tagName: 'h1',
  text: 'The quick brown fox jumps over the lazy dog hehe',
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
