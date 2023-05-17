import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import {forwardRef} from 'react';

export interface MainProps extends HydrogenComponentProps {}

let Main = forwardRef<HTMLDivElement, MainProps>((props, ref) => {
  return <div ref={ref} {...props} />;
});

export default Main;

export let schema: HydrogenComponentSchema = {
  type: 'main',
  title: 'Main',
  inspector: {
    settings: [],
    styles: [],
  },
  toolbar: ['general-settings', ['duplicate', 'delete']],
};
