import {HydrogenStudio, WeaverseHydrogenRoot} from '@weaverse/hydrogen';
import {components} from './components';
import {themeSchema} from './theme-schema';
import {GenericError} from '~/components/GenericError';

export function WeaverseContent() {
  return (
    <WeaverseHydrogenRoot
      components={components}
      errorComponent={GenericError}
    />
  );
}

export function WeaverseStudio() {
  return <HydrogenStudio themeSchema={themeSchema} />;
}
