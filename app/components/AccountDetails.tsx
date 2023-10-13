import type {CustomerDetailsFragment} from 'storefrontapi.generated';
import {Link} from '~/components';

export function AccountDetails({
  customer,
}: {
  customer: CustomerDetailsFragment;
}) {
  const {firstName, lastName, email, phone} = customer;

  return (
    <>
      <div className="grid w-full gap-4 p-4 py-6 md:gap-8 md:p-8 lg:p-12">
        <h3 className="font-bold text-lg">Account Details</h3>
        <div className="p-5 border border-gray-200 rounded space-y-3">
          <div>
            <div className="text-sm text-body/50">Name</div>
            <p className="mt-1">
              {firstName || lastName
                ? (firstName ? firstName + ' ' : '') + lastName
                : 'Add name'}{' '}
            </p>
          </div>
          <div>
            <div className="text-sm text-body/50">Contact</div>
            <p className="mt-1">{phone ?? 'Add mobile'}</p>
          </div>
          <div>
            <div className="text-sm text-body/50">Email address</div>
            <p className="mt-1">{email}</p>
          </div>
          <div>
            <div className="text-sm text-body/50">Password</div>
            <p className="mt-1">**************</p>
          </div>
          <Link
            prefetch="intent"
            className="underline text-sm font-normal"
            to="/account/edit"
          >
            Edit
          </Link>
        </div>
      </div>
    </>
  );
}
