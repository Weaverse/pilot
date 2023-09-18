import {WeaverseHydrogenRoot} from '@weaverse/hydrogen';
import {GenericError} from '~/components/GenericError';
import {components} from './components';

export function WeaverseContent() {
  return (
    <WeaverseHydrogenRoot
      components={components}
      errorComponent={GenericError}
    />
  );
}
