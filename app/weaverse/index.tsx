import {WeaverseHydrogenRoot} from '@weaverse/hydrogen';
import {GenericError} from '~/components/GenericError';
import {components} from './components';
import {countries} from '~/data/countries';
import {themeSchema} from './theme-schema';

export function WeaverseContent() {
  return (
    <WeaverseHydrogenRoot
      components={components}
      countries={countries}
      themeSchema={themeSchema}
      errorComponent={GenericError}
    />
  );
}
