import type {
  ComponentLoaderArgs,
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import {forwardRef} from 'react';
import clsx from 'clsx';
import {Image} from '@shopify/hydrogen';

import {METAOBJECTS_QUERY} from '~/data/queries';
import {Button} from '~/components';

const UserCard = ({user}: {user: any}) => {
  let {fields} = user;
  let image = fields.find((field: any) => field.key === 'avatar');
  let imageData = image?.reference?.image;
  let name = fields.find((field: any) => field.key === 'name')?.value;
  let role = fields.find((field: any) => field.key === 'role')?.value;
  let description = fields.find(
    (field: any) => field.key === 'description',
  )?.value;
  return (
    <div
      className="flex flex-col gap-2 items-center border bg-card text-card-foreground rounded-lg overflow-hidden shadow-lg max-w-sm mx-auto hover:shadow-xl transition-all duration-200"
      data-v0-t="card"
    >
      <Image
        className="object-cover w-full"
        data={imageData}
        style={{aspectRatio: '320/320', objectFit: 'contain'}}
        sizes={'auto'}
      />
      <div className="p-4">
        <h2 className="text-2xl font-bold hover:text-gray-700 transition-all duration-200">
          {name}
        </h2>
        <h3 className="text-gray-500 hover:text-gray-600 transition-all duration-200">
          {role}
        </h3>
        <p className="mt-2 text-gray-600 hover:text-gray-700 transition-all duration-200">
          {description}
        </p>
        <div className="flex mt-4 space-x-2">
          <Button>Follow</Button>
          <Button variant={'secondary'}>Message</Button>
        </div>
      </div>
    </div>
  );
};

interface UserProfilesProps extends HydrogenComponentProps {
  metaObjectData: {
    id: string;
    type: string;
  };
  itemsPerRow: number;
}

const UserProfiles = forwardRef<HTMLDivElement, UserProfilesProps>(
  (props, ref) => {
    let {loaderData, metaObjectData, itemsPerRow, className, ...rest} = props;
    if (!metaObjectData) {
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
    return (
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4"
        ref={ref}
        {...rest}
      >
        <div
          className="grid w-fit mx-auto"
          style={{
            gridTemplateColumns: `repeat(${itemsPerRow}, minmax(0, 1fr))`,
            gap: '16rem',
          }}
        >
          {loaderData?.userProfiles.map((user: any) => {
            return <UserCard key={user.id} user={user} />;
          })}
        </div>
      </div>
    );
  },
);

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
          name: 'metaObjectData',
          shouldRevalidate: true,
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
      ],
    },
  ],
};

export let loader = async (args: ComponentLoaderArgs<UserProfilesProps>) => {
  let {weaverse, data} = args;
  let {storefront} = weaverse;
  if (!data?.metaObjectData) {
    return null;
  }
  let {metaobjects} = await storefront.query(METAOBJECTS_QUERY, {
    variables: {
      type: data.metaObjectData.type,
      first: 10,
    },
  });
  return {
    userProfiles: metaobjects.nodes,
  };
};
export default UserProfiles;
