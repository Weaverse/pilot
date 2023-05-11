import {fetchWithServerCache} from '@weaverse/hydrogen';
import {forwardRef} from 'react';

let ImageWithText = forwardRef((props, ref) => {
  console.log('👉 --------> - props:', props);
  let {loaderData, thumbnailUrl, ...rest} = props;
  return (
    <section className="text-gray-600 body-font" ref={ref} {...rest}>
      <div className="container mx-auto flex px-5 py-24 md:flex-row flex-col items-center">
        <div className="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center">
          {props.children}
          {/* <h1 className="title-font sm:text-4xl text-3xl mb-4 font-medium text-gray-900">
            Before they sold out
            <br className="hidden lg:inline-block" />
            readymade gluten
          </h1> */}
          <p className="mb-8 leading-relaxed">
            Copper mug try-hard pitchfork pour-over freegan heirloom neutra air
            plant cold-pressed tacos poke beard tote bag. Heirloom echo park
            mlkshk tote bag selvage hot chicken authentic tumeric truffaut
            hexagon try-hard chambray.
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
            src={loaderData.thumbnailUrl}
          />
        </div>
      </div>
    </section>
  );
});

export default ImageWithText;

export let loader = async (args) => {
  console.log('👉 --------> - loader...');
  // fetch fake json data from https://jsonplaceholder.typicode.com/
  let data = await fetchWithServerCache({
    url: 'https://jsonplaceholder.typicode.com/photos/1',
    storefront: args.context.storefront,
  }).then((r) => r.json());
  console.log('👉 --------> - data:', data);
  return data;
};

// Same as weaverse's section element schema
export let schema = {
  type: 'image-with-text',
  title: 'Image with Text',
  settings: [
    {
      type: 'image',
      name: 'thumbnailUrl',
      title: 'Image',
    }
  ]
}
