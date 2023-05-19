import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
  WeaverseLoaderArgs,
} from '@weaverse/hydrogen';
import {fetchWithServerCache} from '@weaverse/hydrogen';
import {forwardRef} from 'react';

export interface ImageWithTextProps
  extends HydrogenComponentProps<Awaited<ReturnType<typeof loader>>> {
  image: string;
}

let ImageWithText = forwardRef<HTMLElement, ImageWithTextProps>(
  (props, ref) => {
    let {loaderData, image, ...rest} = props;
    return (
      <section ref={ref} {...rest}>
        <div className="text-gray-600 body-font bg-slate-300">
          <div className="container mx-auto flex px-5 py-24 md:flex-row flex-col items-center">
            <div className="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center">
              {props.children}
              <p className="mb-8 leading-relaxed">
                Copper mug try-hard pitchfork pour-over freegan heirloom neutra
                air plant cold-pressed tacos poke beard tote bag. Heirloom echo
                park mlkshk tote bag selvage hot chicken authentic tumeric
                truffaut hexagon try-hard chambray.
              </p>
              <div className="flex justify-center">
                <button className="inline-flex text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg">
                  Button
                </button>
                <button className="ml-4 inline-flex text-gray-700 bg-gray-100 border-0 py-2 px-6 focus:outline-none hover:bg-gray-200 rounded text-lg">
                  Button
                </button>
              </div>
            </div>
            <div className="lg:max-w-lg lg:w-full md:w-1/2 w-5/6">
              <img
                className="object-cover object-center rounded"
                alt="hero"
                src={loaderData?.thumbnailUrl || image}
              />
            </div>
          </div>
        </div>
      </section>
    );
  },
);

export default ImageWithText;

// Example types
type PlaceholderType = {
  url: string;
  thumbnailUrl: string;
};

export let loader = async (args: WeaverseLoaderArgs) => {
  let data: PlaceholderType = await fetchWithServerCache({
    url: 'https://jsonplaceholder.typicode.com/photos/1',
    context: args.context,
  }).then((r) => r.json());
  return data;
};

export let schema: HydrogenComponentSchema = {
  type: 'image-with-text',
  title: 'Image with Text',
  inspector: {
    settings: [],
    styles: [],
  },
  toolbar: ['general-settings', ['duplicate', 'delete']],
  flags: {
    isSection: true,
  },
};
