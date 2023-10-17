import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import { forwardRef } from 'react';
import { CSSProperties } from 'react';
import { Image } from '@shopify/hydrogen';


interface MapProps extends HydrogenComponentProps {

}

let Map = forwardRef<HTMLElement, MapProps>((props, ref) => {
  let { ...rest } = props;
  let sectionStyle: CSSProperties = {
    '--section-height': `450px`,
  } as CSSProperties;
  return (
    <section ref={ref} {...rest} className='flex relative p-10 overflow-hidden h-[var(--section-height)]' style={sectionStyle}>
      <div className='absolute inset-0'>
        <Image src='' className='w-full h-full object-cover' />
        <div className='absolute inset-0 bg-black opacity-50'></div>
      </div>
      <div className='relative bg-white rounded-3xl p-8 border-2 border-solid border-gray-200 h-fit'>
        <div className='z-10 flex flex-col gap-6'>
          <p className='font-sans text-2xl font-bold'>Our store address</p>
          <p className='font-sans text-sm font-normal'>Inglewood, Californina <br />US, 90301</p>
          <p className='font-sans text-sm font-normal'>Mon - Fri: 8AM - 10PM <br />Sat - Sun: 9AM - 9PM</p>
          <a href="" className='px-4 py-3 w-fit cursor-pointer rounded border-2 border-solid border-gray-900 inline-block'>Get Directions</a>
        </div>
      </div>
    </section>
  );
});

export default Map;

export let schema: HydrogenComponentSchema = {
  type: 'map',
  title: 'Map',
  toolbar: ['general-settings', ['duplicate', 'delete']],
  inspector: [
    {
      group: 'Map',
      inputs: [],
    },
  ],
};
