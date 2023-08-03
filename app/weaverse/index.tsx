import {WeaverseHydrogenRoot} from '@weaverse/hydrogen';
import {components} from './components';
import {themeSchema} from './theme-schema';

export function WeaverseContent() {
  return (
    <WeaverseHydrogenRoot components={components} themeSchema={themeSchema} />
  );
}
