import type {InspectorGroup} from '@weaverse/hydrogen';

export function Overlay({color, opacity}: {color: string; opacity: number}) {
  return (
    <div
      className="absolute inset-0"
      style={{backgroundColor: color, opacity: opacity / 100}}
    />
  );
}

export let overlayInputs: InspectorGroup['inputs'] = [
  {
    type: 'heading',
    label: 'Overlay',
  },
  {
    type: 'switch',
    name: 'enableOverlay',
    label: 'Enable overlay',
    defaultValue: false,
  },
  {
    type: 'color',
    name: 'overlayColor',
    label: 'Overlay color',
    defaultValue: '#000000',
    condition: 'enableOverlay.eq.true',
  },
  {
    type: 'range',
    name: 'overlayOpacity',
    label: 'Overlay opacity',
    defaultValue: 50,
    configs: {
      min: 0,
      max: 100,
      step: 1,
      unit: '%',
    },
    condition: 'enableOverlay.eq.true',
  },
];
