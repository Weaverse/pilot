import { Form } from "@remix-run/react";
import type { CustomerAddress } from "@shopify/hydrogen/customer-account-api-types";
import type { CustomerDetailsFragment } from "customer-accountapi.generated";
import Button from "~/components/button";
import { Link } from "~/components/link";
import { Text } from "./text";

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
      <div>
        {!addresses?.length && (
          <Text className="mb-1" size="fine" width="narrow" as="p">
            You haven&apos;t saved any addresses yet.
          </Text>
        )}
        <div className="">
          <Button link="address/add" className="mb-5" variant="primary">
            Add an Address
          </Button>
        </div>
        {Boolean(addresses?.length) && (
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
        )}
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
          <span className="px-3 py-1 text-xs font-medium border text-body/50">
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
          className="text-left underline text-body/50"
          prefetch="intent"
        >
          Edit
        </Link>
        <Form action="address/delete" method="delete">
          <input type="hidden" name="addressId" value={address.id} />
          <button className="text-left text-body/50 ml-6 text-sm">
            Remove
          </button>
        </Form>
      </div>
    </div>
  );
}
