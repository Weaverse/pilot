import {components} from './components';
import {sections} from './sections';
export let allComponents = {
  ...components,
  ...sections,
};

/** @type {import('@weaverse/hydrogen').WeaverseHydrogenRootProps)}  */
export let config = {
  components: allComponents,
  themeSchema: [
    {
      group: 'Weaverse',
      inputs: [
        {
          name: 'primaryColor',
          type: 'color',
          label: 'Primary Color',
          value: '#000000',
        },
      ],
    },
  ],
};

export default config;
