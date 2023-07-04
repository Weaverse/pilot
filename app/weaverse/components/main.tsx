import {
  useThemeSetting,
  type HydrogenComponentProps,
  type HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import {forwardRef} from 'react';

interface MainProps extends HydrogenComponentProps {}

let Main = forwardRef<HTMLDivElement, MainProps>((props, ref) => {
  let themeSetting = useThemeSetting();
  console.log('Main', themeSetting);

  let {...rest} = props;
  return <div ref={ref} {...rest} />;
});

export default Main;

export let schema: HydrogenComponentSchema = {
  type: 'main',
  title: 'Main',
  inspector: [],
  toolbar: ['general-settings', ['duplicate', 'delete']],
};
