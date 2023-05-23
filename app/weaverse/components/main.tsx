import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import {forwardRef} from 'react';

type MainData = Record<string, unknown>;

let Main = forwardRef<HTMLDivElement, HydrogenComponentProps<MainData>>(
  (props, ref) => {
    let {data, ...rest} = props;
    return <div ref={ref} {...rest} />;
  },
);

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
