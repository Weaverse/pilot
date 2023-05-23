import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import React from 'react';
import {forwardRef} from 'react';

interface TextProps
  extends HydrogenComponentProps<{
    tagName: string;
    text: string;
  }> {}

let Text = forwardRef<HTMLElement, TextProps>((props, ref) => {
  let {data, ...rest} = props;
  let {tagName, text} = data;
  return React.createElement(tagName, {ref, ...rest}, text);
});

Text.defaultProps = {
  data: {
    tagName: 'h1',
    text: 'The quick brown fox jumps over the lazy dog hehe',
    className: 'title-font sm:text-4xl text-3xl mb-4 font-medium text-gray-900',
  },
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
