import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import React from 'react';
import {forwardRef} from 'react';

type TextData = {
  tagName: string;
  text: string;
};

let Text = forwardRef<HTMLElement, HydrogenComponentProps<TextData>>(
  (props, ref) => {
    let {data, ...rest} = props;
    let {tagName, text} = data;
    return React.createElement(tagName, {ref, ...rest}, text);
  },
);

Text.defaultProps = {
  data: {
    tagName: 'h1',
    text: 'The quick brown fox jumps over the lazy dog',
    className: 'title-font sm:text-4xl text-3xl mb-4 font-medium text-gray-900',
  },
};

export let schema: HydrogenComponentSchema = {
  type: 'text',
  title: 'Text',
  inspector: {
    settings: [
      {
        groupType: 'basic',
        groupHeader: 'Text',
        inputs: [
          {
            type: 'text',
            label: 'Text',
            name: 'text',
            placeholder: 'Enter text here',
          },
          {
            type: 'select',
            label: 'HTML tag',
            name: 'tagName',
            configs: {
              options: [
                {value: 'h1', label: 'Heading 1'},
                {value: 'h2', label: 'Heading 2'},
                {value: 'h3', label: 'Heading 3'},
                {value: 'h4', label: 'Heading 4'},
                {value: 'h5', label: 'Heading 5'},
                {value: 'h6', label: 'Heading 6'},
                {value: 'p', label: 'Paragraph'},
              ],
            },
            defaultValue: 'h2',
            helpText:
              'This setting change the HTML tag only, not the style of the element.',
          },
        ],
      },
    ],
  },
  toolbar: ['general-settings', ['duplicate', 'delete']],
};

export default Text;
