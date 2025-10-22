import { CheckIcon } from "@phosphor-icons/react";
import * as Checkbox from "@radix-ui/react-checkbox";
import * as Dialog from "@radix-ui/react-dialog";
import { flattenConnection } from "@shopify/hydrogen";
import type { CustomerAddressInput } from "@shopify/hydrogen/customer-account-api-types";
import clsx from "clsx";
import type {
  CustomerAddressCreateMutation,
  CustomerAddressDeleteMutation,
  CustomerAddressUpdateMutation,
} from "customer-account-api.generated";
import type { ActionFunction } from "react-router";
import {
  data,
  Form,
  redirect,
  useActionData,
  useNavigation,
  useOutletContext,
  useParams,
} from "react-router";
import invariant from "tiny-invariant";
import { Button } from "~/components/button";
import Link from "~/components/link";
import type { AccountOutletContext } from "~/routes/account/edit";
import { doLogout } from "../auth/logout";
import {
  CREATE_ADDRESS_MUTATION,
  DELETE_ADDRESS_MUTATION,
  UPDATE_ADDRESS_MUTATION,
} from "./address-mutation-queries";

export const handle = {
  renderInModal: true,
};

const ADDRESS_INPUT_KEYS: (keyof CustomerAddressInput)[] = [
  "lastName",
  "firstName",
  "address1",
  "address2",
  "city",
  "zoneCode",
  "territoryCode",
  "zip",
  "phoneNumber",
  "company",
];

export const action: ActionFunction = async ({ request, context, params }) => {
  const { customerAccount } = context;
  const formData = await request.formData();

  // Double-check current user is logged in.
  // Will throw a logout redirect if not.
  if (!(await customerAccount.isLoggedIn())) {
    throw await doLogout(context);
  }

  const addressId = formData.get("addressId");
  invariant(typeof addressId === "string", "You must provide an address id.");

  if (request.method === "DELETE") {
    try {
      const { data: deleteData, errors } =
        await customerAccount.mutate<CustomerAddressDeleteMutation>(
          DELETE_ADDRESS_MUTATION,
          {
            variables: {
              addressId,
              language: customerAccount.i18n.language,
            },
          },
        );

      invariant(!errors?.length, errors?.[0]?.message);
      invariant(
        !deleteData?.customerAddressDelete?.userErrors?.length,
        deleteData?.customerAddressDelete?.userErrors?.[0]?.message,
      );

      return redirect(
        params?.locale ? `${params?.locale}/account` : "/account",
      );
    } catch (error: unknown) {
      return data(
        { formError: error instanceof Error ? error.message : "Unknown error" },
        {
          status: 400,
        },
      );
    }
  }

  const address: CustomerAddressInput = {};
  for (const key of ADDRESS_INPUT_KEYS) {
    const value = formData.get(key);
    if (typeof value === "string") {
      address[key] = value;
    }
  }

  const defaultAddress = formData.has("defaultAddress")
    ? String(formData.get("defaultAddress")) === "on"
    : false;

  if (addressId === "add") {
    try {
      const { data: createData, errors } =
        await customerAccount.mutate<CustomerAddressCreateMutation>(
          CREATE_ADDRESS_MUTATION,
          {
            variables: {
              address,
              defaultAddress,
              language: customerAccount.i18n.language,
            },
          },
        );

      invariant(!errors?.length, errors?.[0]?.message);
      invariant(
        !createData?.customerAddressCreate?.userErrors?.length,
        createData?.customerAddressCreate?.userErrors?.[0]?.message,
      );
      invariant(
        createData?.customerAddressCreate?.customerAddress?.id,
        "Expected customer address to be created",
      );

      return redirect(
        params?.locale ? `${params?.locale}/account` : "/account",
      );
    } catch (error: unknown) {
      return data(
        { formError: error instanceof Error ? error.message : "Unknown error" },
        {
          status: 400,
        },
      );
    }
  } else {
    try {
      const { data: updateData, errors } =
        await customerAccount.mutate<CustomerAddressUpdateMutation>(
          UPDATE_ADDRESS_MUTATION,
          {
            variables: {
              address,
              addressId,
              defaultAddress,
              language: customerAccount.i18n.language,
            },
          },
        );

      invariant(!errors?.length, errors?.[0]?.message);
      invariant(
        !updateData?.customerAddressUpdate?.userErrors?.length,
        updateData?.customerAddressUpdate?.userErrors?.[0]?.message,
      );

      return redirect(
        params?.locale ? `${params?.locale}/account` : "/account",
      );
    } catch (error: unknown) {
      return data(
        { formError: error instanceof Error ? error.message : "Unknown error" },
        {
          status: 400,
        },
      );
    }
  }
};

export default function AccountEditAddressForm() {
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="firstName" className="mb-1 block">
              First name
            </label>
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
          </div>
          <div>
            <label htmlFor="lastName" className="mb-1 block">
              Last name
            </label>
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
          </div>
          <div className="md:col-span-2">
            <label htmlFor="company" className="mb-1 block">
              Company
            </label>
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
          </div>
          <div className="md:col-span-2">
            <label htmlFor="address1" className="mb-1 block">
              Address line 1
            </label>
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
          </div>
          <div className="md:col-span-2">
            <label htmlFor="address2" className="mb-1 block">
              Address line 2
            </label>
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
          </div>
          <div>
            <label htmlFor="city" className="mb-1 block">
              City
            </label>
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
          </div>
          <div>
            <label htmlFor="zoneCode" className="mb-1 block">
              State / Province
            </label>
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
          </div>
          <div>
            <label htmlFor="zip" className="mb-1 block">
              Zip / Postal Code
            </label>
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
          </div>
          <div className="space-y-1">
            <label htmlFor="territoryCode">Country</label>
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
          </div>
          <div className="space-y-1">
            <label htmlFor="phone">Phone</label>
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
          </div>
        </div>
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
