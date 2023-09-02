import {
  type HydrogenComponentProps,
  type HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import {forwardRef} from 'react';

interface MainProps extends HydrogenComponentProps {}

/*
  Main is the default Weaverse component that is used to render the main content.
  This component wraps all the sections/components inside a Weaverse page.
*/
let Main = forwardRef<HTMLDivElement, MainProps>((props, ref) => {
  return <div ref={ref} {...props} />;
});

export default Main;

export let schema: HydrogenComponentSchema = {
  type: 'main',
  title: 'Main',
  inspector: [],
};
