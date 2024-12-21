import { Form } from "@remix-run/react";
import type { CustomerAddress } from "@shopify/hydrogen/customer-account-api-types";
import type { CustomerDetailsFragment } from "customer-accountapi.generated";
import { Link } from "~/components/link";

export function AccountAddressBook({
  customer,
  addresses,
}: {
  customer: CustomerDetailsFragment;
  addresses: CustomerAddress[];
}) {
  return (
    <div className="space-y-4">
      <div className="font-bold">Address Book</div>
      <div className="space-y-3">
        {!addresses?.length && (
          <div>You haven&apos;t saved any addresses yet.</div>
        )}
        <div className="">
          <Link to="address/add" className="mb-5" variant="outline">
            Add an Address
          </Link>
        </div>
        {addresses?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {customer.defaultAddress && (
              <Address address={customer.defaultAddress} defaultAddress />
            )}
            {addresses
              .filter((address) => address.id !== customer.defaultAddress?.id)
              .map((address) => (
                <Address key={address.id} address={address} />
              ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Address({
  address,
  defaultAddress,
}: {
  address: CustomerAddress;
  defaultAddress?: boolean;
}) {
  return (
    <div className="p-5 border border-[#B7B7B7] rounded-sm flex flex-col">
      {defaultAddress && (
        <div className="mb-3 flex flex-row">
          <span className="px-3 py-1 text-xs font-medium border text-body-subtle">
            Default
          </span>
        </div>
      )}
      <ul className="flex-1 flex-row">
        {(address.firstName || address.lastName) && (
          <li className="mb-2">
            {`${address.firstName && `${address.firstName} `}${
              address?.lastName
            }`}
          </li>
        )}
        {address.formatted?.map((line: string) => (
          <li key={line}>{line}</li>
        ))}
      </ul>

      <div className="flex flex-row font-medium mt-6 items-baseline">
        <Link
          to={`/account/address/${encodeURIComponent(address.id)}`}
          className="text-left underline text-body-subtle"
          prefetch="intent"
        >
          Edit
        </Link>
        <Form action="address/delete" method="delete">
          <input type="hidden" name="addressId" value={address.id} />
          <button className="text-left text-body-subtle ml-6 text-sm">
            Remove
          </button>
        </Form>
      </div>
    </div>
  );
}
