import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
  WeaverseLoaderArgs,
} from '@weaverse/hydrogen';
import {fetchWithServerCache} from '@weaverse/hydrogen';
import {forwardRef} from 'react';

type ImageWithTextLoaderData = Awaited<ReturnType<typeof loader>>;

interface ImageWithTextProps
  extends HydrogenComponentProps<ImageWithTextLoaderData> {
  image: string;
}

let ImageWithText = forwardRef<HTMLElement, ImageWithTextProps>(
  (props, ref) => {
    let {loaderData, image, ...rest} = props;
    return (
      <section ref={ref} {...rest}>
        <div className="text-gray-600 body-font bg-slate-300">
          <div className="container mx-auto flex px-5 py-24 md:flex-row flex-col items-center">
            <div className="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center space-y-4">
              {props.children}
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
  childTypes: ['text', 'image-with-text--actions'],
  inspector: [
    {
      group: 'Image with Text',
      inputs: [
        {
          type: 'image',
          label: 'Image',
          name: 'src',
          defaultValue:
            'https://images.unsplash.com/photo-1617606002806-94e279c22567?auto=format&fit=crop&w=1000&q=80',
        },
      ],
    },
  ],
  toolbar: ['general-settings', ['duplicate', 'delete']],
  presets: {
    children: [{type: 'text'}],
  },
};
