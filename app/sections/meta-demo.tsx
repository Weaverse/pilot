import {Image} from '@shopify/hydrogen';
import type {
  ComponentLoaderArgs,
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import clsx from 'clsx';
import {forwardRef} from 'react';

import {METAOBJECTS_QUERY} from '~/data/queries';

type MetaObjectField = {
  key: string;
  type: string;
  value: any;
  reference?: any;
};

type MetaobjectData = {
  handle: string;
  id: string;
  type: string;
  fields: MetaObjectField[];
};

type MetaDemoProps = HydrogenComponentProps & {
  metaDemo: {
    id: string;
    type: string;
  };
  title: string;
  itemsPerRow: number;
  gap: number;
};

let MetaDemo = forwardRef<HTMLDivElement, MetaDemoProps>((props, ref) => {
  let {loaderData, metaDemo, title, itemsPerRow, gap, className, ...rest} =
    props;
  if (!metaDemo) {
    return (
      <section
        className={clsx(
          'w-full px-6 py-12 md:py-24 lg:py-32 bg-amber-50 mx-auto',
          className,
        )}
        ref={ref}
        {...rest}
      >
        <p className="text-center">Please select a metaobject definition</p>
      </section>
    );
  }
  let items = loaderData?.metaobjects.map(
    (metaObject: MetaobjectData, ind: number) => {
      let {fields} = metaObject;
      let image = fields.find((field) => field.key === 'avatar');
      let imageData = image?.reference?.image;
      let name = fields.find((field) => field.key === 'name')?.value;
      let title = fields.find((field) => field.key === 'title')?.value;
      return (
        <div key={ind} className="flex flex-col gap-2 items-center">
          <div className="rounded-md overflow-hidden w-44">
            <Image
              data={imageData}
              sizes="auto"
              className="h-auto"
              aspectRatio="1/1"
            />
          </div>
          <h3 className="font-semibold text-xl">{name}</h3>
          <p>{title}</p>
        </div>
      );
    },
  );
  return (
    <section
      className={clsx(
        'max-w-7xl px-6 py-12 md:py-24 lg:py-32 w-fit mx-auto',
        className,
      )}
      ref={ref}
      {...rest}
    >
      <h2 className="text-center font-semibold mb-8">{title}</h2>
      <div
        className="grid w-fit mx-auto"
        style={{
          gridTemplateColumns: `repeat(${itemsPerRow}, minmax(0, 1fr))`,
          gap: `${gap}px`,
        }}
      >
        {items}
      </div>
    </section>
  );
});

export let loader = async (args: ComponentLoaderArgs<MetaDemoProps>) => {
  let {weaverse, data} = args;
  let {storefront} = weaverse;
  if (!data?.metaDemo) {
    return null;
  }
  let {metaobjects} = await storefront.query(METAOBJECTS_QUERY, {
    variables: {
      type: data.metaDemo.type,
      first: 10,
    },
  });
  return {
    metaobjects: metaobjects.nodes,
  };
};

export let schema: HydrogenComponentSchema = {
  type: 'meta-demo',
  title: 'Metaobject Demo',
  toolbar: ['general-settings', ['duplicate', 'delete']],
  inspector: [
    {
      group: 'Metaobject Demo',
      inputs: [
        {
          label: 'Select metaobject definition',
          type: 'metaobject',
          helpText:
            '<a href="https://weaverse.io/docs/marketplace/the-pilot-theme#metaobjects" target="_blank">How to display this demo section</a>',
          name: 'metaDemo',
          shouldRevalidate: true,
        },
        {
          label: 'Title',
          type: 'text',
          name: 'title',
          defaultValue: 'Title',
        },
        {
          label: 'Items per row',
          name: 'itemsPerRow',
          type: 'range',
          configs: {
            min: 1,
            max: 10,
          },
          defaultValue: 3,
        },
        {
          label: 'Gap between items',
          name: 'gap',
          type: 'range',
          configs: {
            min: 0,
            step: 2,
            max: 100,
          },
          defaultValue: 10,
        },
      ],
    },
  ],
};

export default MetaDemo;
