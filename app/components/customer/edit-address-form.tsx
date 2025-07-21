import { CheckIcon } from "@phosphor-icons/react";
import * as Checkbox from "@radix-ui/react-checkbox";
import * as Dialog from "@radix-ui/react-dialog";
import { flattenConnection } from "@shopify/hydrogen";
import clsx from "clsx";
import {
  Form,
  useActionData,
  useNavigation,
  useOutletContext,
  useParams,
} from "react-router";
import { Button } from "~/components/button";
import Link from "~/components/link";
import type { AccountOutletContext } from "~/routes/($locale).account.edit";

export function AccountEditAddressForm() {
  const { id: addressId } = useParams();
  const isNewAddress = addressId === "add";
  const actionData = useActionData<{ formError?: string }>();
  const { state } = useNavigation();
  const { customer } = useOutletContext<AccountOutletContext>();
  const addresses = flattenConnection(customer.addresses);
  const defaultAddress = customer.defaultAddress;
  /**
   * When a refresh happens (or a user visits this link directly), the URL
   * is actually stale because it contains a special token. This means the data
   * loaded by the parent and passed to the outlet contains a newer, fresher token,
   * and we don't find a match. We update the `find` logic to just perform a match
   * on the first (permanent) part of the ID.
   */
  const normalizedAddress = decodeURIComponent(addressId ?? "").split("?")[0];
  const address = addresses.find((ad) => ad.id?.startsWith(normalizedAddress));

  return (
    <div className="space-y-2">
      <div className="py-2.5 text-xl">
        {isNewAddress ? "Add new address" : "Edit address"}
      </div>
      <Form method="post" className="space-y-3">
        <input
          type="hidden"
          name="addressId"
          value={address?.id ?? addressId}
        />
        {actionData?.formError && (
          <div className="flex items-center justify-center bg-red-100 p-3 text-red-900">
            {actionData.formError}
          </div>
        )}
        <input
          className="w-full appearance-none border border-line p-3 focus:outline-hidden"
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
          className="w-full appearance-none border border-line p-3 focus:outline-hidden"
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
          className="w-full appearance-none border border-line p-3 focus:outline-hidden"
          id="company"
          name="company"
          type="text"
          autoComplete="organization"
          placeholder="Company"
          aria-label="Company"
          defaultValue={address?.company ?? ""}
        />
        <input
          className="w-full appearance-none border border-line p-3 focus:outline-hidden"
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
          className="w-full appearance-none border border-line p-3 focus:outline-hidden"
          id="address2"
          name="address2"
          type="text"
          autoComplete="address-line2"
          placeholder="Address line 2"
          aria-label="Address line 2"
          defaultValue={address?.address2 ?? ""}
        />
        <input
          className="w-full appearance-none border border-line p-3 focus:outline-hidden"
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
          className="w-full appearance-none border border-line p-3 focus:outline-hidden"
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
          className="w-full appearance-none border border-line p-3 focus:outline-hidden"
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
          className="w-full appearance-none border border-line p-3 focus:outline-hidden"
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
          className="w-full appearance-none border border-line p-3 focus:outline-hidden"
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
              "h-5 w-5 shrink-0",
              "border border-line focus-visible:outline-hidden",
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
          >
            <Checkbox.Indicator className="flex items-center justify-center text-current">
              <CheckIcon className="h-4 w-4" weight="regular" />
            </Checkbox.Indicator>
          </Checkbox.Root>
          <label htmlFor="defaultAddress">Set as default address</label>
        </div>
        <div className="flex items-center justify-end gap-6">
          <Dialog.Close asChild>
            <Link
              to="/account/address"
              className="underline-offset-4 hover:underline"
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
