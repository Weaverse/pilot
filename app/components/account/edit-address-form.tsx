import { Check } from "@phosphor-icons/react";
import * as Checkbox from "@radix-ui/react-checkbox";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Form,
  useActionData,
  useNavigation,
  useOutletContext,
  useParams,
} from "@remix-run/react";
import { flattenConnection } from "@shopify/hydrogen";
import clsx from "clsx";
import { Button } from "~/components/button";
import Link from "~/components/link";
import type { AccountOutletContext } from "~/routes/($locale).account.edit";

export function AccountEditAddressForm() {
  let { id: addressId } = useParams();
  let isNewAddress = addressId === "add";
  let actionData = useActionData<{ formError?: string }>();
  let { state } = useNavigation();
  let { customer } = useOutletContext<AccountOutletContext>();
  let addresses = flattenConnection(customer.addresses);
  let defaultAddress = customer.defaultAddress;
  /**
   * When a refresh happens (or a user visits this link directly), the URL
   * is actually stale because it contains a special token. This means the data
   * loaded by the parent and passed to the outlet contains a newer, fresher token,
   * and we don't find a match. We update the `find` logic to just perform a match
   * on the first (permanent) part of the ID.
   */
  let normalizedAddress = decodeURIComponent(addressId ?? "").split("?")[0];
  let address = addresses.find((address) =>
    address.id?.startsWith(normalizedAddress),
  );

  return (
    <div className="space-y-2">
      <div className="text-xl py-2.5">
        {isNewAddress ? "Add new address" : "Edit address"}
      </div>
      <Form method="post" className="space-y-3">
        <input
          type="hidden"
          name="addressId"
          value={address?.id ?? addressId}
        />
        {actionData?.formError && (
          <div className="flex items-center justify-center bg-red-100 text-red-900 p-3">
            {actionData.formError}
          </div>
        )}
        <input
          className="appearance-none border border-line p-3 focus:outline-none w-full"
          id="firstName"
          name="firstName"
          required
          type="text"
          autoComplete="given-name"
          placeholder="First name"
          aria-label="First name"
          defaultValue={address?.firstName ?? ""}
        />
        <input
          className="appearance-none border border-line p-3 focus:outline-none w-full"
          id="lastName"
          name="lastName"
          required
          type="text"
          autoComplete="family-name"
          placeholder="Last name"
          aria-label="Last name"
          defaultValue={address?.lastName ?? ""}
        />
        <input
          className="appearance-none border border-line p-3 focus:outline-none w-full"
          id="company"
          name="company"
          type="text"
          autoComplete="organization"
          placeholder="Company"
          aria-label="Company"
          defaultValue={address?.company ?? ""}
        />
        <input
          className="appearance-none border border-line p-3 focus:outline-none w-full"
          id="address1"
          name="address1"
          type="text"
          autoComplete="address-line1"
          placeholder="Address line 1*"
          required
          aria-label="Address line 1"
          defaultValue={address?.address1 ?? ""}
        />
        <input
          className="appearance-none border border-line p-3 focus:outline-none w-full"
          id="address2"
          name="address2"
          type="text"
          autoComplete="address-line2"
          placeholder="Address line 2"
          aria-label="Address line 2"
          defaultValue={address?.address2 ?? ""}
        />
        <input
          className="appearance-none border border-line p-3 focus:outline-none w-full"
          id="city"
          name="city"
          type="text"
          required
          autoComplete="address-level2"
          placeholder="City"
          aria-label="City"
          defaultValue={address?.city ?? ""}
        />
        <input
          className="appearance-none border border-line p-3 focus:outline-none w-full"
          id="zoneCode"
          name="zoneCode"
          type="text"
          autoComplete="address-level1"
          placeholder="State / Province (zoneCode)"
          required
          aria-label="State / Province (zoneCode)"
          defaultValue={address?.zoneCode ?? ""}
        />
        <input
          className="appearance-none border border-line p-3 focus:outline-none w-full"
          id="zip"
          name="zip"
          type="text"
          autoComplete="postal-code"
          placeholder="Zip / Postal Code"
          required
          aria-label="Zip"
          defaultValue={address?.zip ?? ""}
        />
        <input
          className="appearance-none border border-line p-3 focus:outline-none w-full"
          id="territoryCode"
          name="territoryCode"
          type="text"
          autoComplete="country"
          placeholder="Country (Territory) Code"
          required
          aria-label="Country (Territory) Code"
          defaultValue={address?.territoryCode ?? ""}
        />
        <input
          className="appearance-none border border-line p-3 focus:outline-none w-full"
          id="phone"
          name="phoneNumber"
          type="tel"
          autoComplete="tel"
          placeholder="Phone"
          aria-label="Phone"
          defaultValue={address?.phoneNumber ?? ""}
        />
        <div className="flex items-center gap-2.5">
          <Checkbox.Root
            name="defaultAddress"
            id="defaultAddress"
            defaultChecked={defaultAddress?.id === address?.id}
            className={clsx(
              "w-5 h-5 shrink-0",
              "border border-line focus-visible:outline-none",
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
          >
            <Checkbox.Indicator className="flex items-center justify-center text-current">
              <Check className="w-4 h-4" weight="regular" />
            </Checkbox.Indicator>
          </Checkbox.Root>
          <label htmlFor="defaultAddress">Set as default address</label>
        </div>
        <div className="flex gap-6 items-center justify-end">
          <Dialog.Close asChild>
            <Link
              to="/account/address"
              className="hover:underline underline-offset-4"
            >
              Cancel
            </Link>
          </Dialog.Close>
          <Button
            className="mb-2"
            type="submit"
            variant="primary"
            disabled={state !== "idle"}
          >
            {state === "submitting" ? "Saving" : "Save"}
          </Button>
        </div>
      </Form>
    </div>
  );
}
