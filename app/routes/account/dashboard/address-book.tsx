import type { CustomerAddress } from "@shopify/hydrogen/customer-account-api-types";
import type { CustomerDetailsFragment } from "customer-account-api.generated";
import { Form } from "react-router";
import { Button } from "~/components/button";
import { Link } from "~/components/link";

export function AddressBook({
  customer,
  addresses,
}: {
  customer: CustomerDetailsFragment;
  addresses: CustomerAddress[];
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-base font-bold">Address Book</h2>
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
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
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
    <div className="border-line-subtle flex flex-col rounded-xl border p-5">
      {defaultAddress && (
        <div className="mb-3 flex flex-row">
          <span className="bg-body-subtle text-body-inverse rounded px-3 py-1 text-sm font-medium">
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

      <div className="mt-6 flex flex-row items-baseline font-medium">
        <Link
          to={`/account/address/${encodeURIComponent(address.id)}`}
          className="text-body-subtle after:bg-body-subtle"
          prefetch="intent"
          variant="underline"
        >
          Edit
        </Link>
        <Form action="address/delete" method="delete">
          <input type="hidden" name="addressId" value={address.id} />
          <Button
            variant="underline"
            type="submit"
            className="text-body-subtle after:bg-body-subtle ml-6"
            animate={false}
          >
            Remove
          </Button>
        </Form>
      </div>
    </div>
  );
}
