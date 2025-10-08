import type { CustomerAddress } from "@shopify/hydrogen/customer-account-api-types";
import type { CustomerDetailsFragment } from "customer-account-api.generated";
import { Form } from "react-router";
import { Button } from "~/components/button";
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
    <div className="flex flex-col border border-line-subtle p-5">
      {defaultAddress && (
        <div className="mb-3 flex flex-row">
          <span className="bg-body-subtle px-3 py-1 font-medium text-body-inverse text-sm">
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
            className="ml-6 text-body-subtle after:bg-body-subtle"
            animate={false}
          >
            Remove
          </Button>
        </Form>
      </div>
    </div>
  );
}
