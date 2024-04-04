import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import {forwardRef} from 'react';

const UserCard = () => {
  return (
    <div
      className="border bg-card text-card-foreground rounded-lg overflow-hidden shadow-lg max-w-sm mx-auto hover:shadow-xl transition-all duration-200"
      data-v0-t="card"
    >
      <img
        alt="Profile picture"
        className="object-cover w-full"
        height="320"
        src="https://cdn.shopify.com/s/files/1/0728/0410/6547/files/medium_3.webp?v=1702346343"
        style={{aspectRatio: '320/320', objectFit: 'cover'}}
        width="320"
      />
      <div className="p-4">
        <h2 className="text-2xl font-bold hover:text-gray-700 transition-all duration-200">
          Emily Johnson
        </h2>
        <h3 className="text-gray-500 hover:text-gray-600 transition-all duration-200">
          Front-end Developer
        </h3>
        <p className="mt-2 text-gray-600 hover:text-gray-700 transition-all duration-200">
          Passionate about creating interactive user interfaces.
        </p>
        <div className="flex mt-4 space-x-2">
          <button className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground h-9 rounded-md px-3 w-full hover:bg-gray-700 hover:text-white transition-all duration-200">
            Follow
          </button>
          <button className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent h-9 rounded-md px-3 w-full hover:border-gray-700 hover:text-gray-700 transition-all duration-200">
            Message
          </button>
        </div>
      </div>
    </div>
  );
};

interface UserProfilesProps extends HydrogenComponentProps {}
const UserProfiles = forwardRef<HTMLDivElement, UserProfilesProps>(
  (props, ref) => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        <UserCard />
      </div>
    );
  },
);

export const schema: HydrogenComponentSchema = {
  title: 'User Profiles',
  type: 'user-profiles',
  inspector: [],
};

export default UserProfiles;
