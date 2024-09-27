import {
  Form,
  useActionData,
  useNavigation,
  useOutletContext,
  useParams,
} from "@remix-run/react";
import { flattenConnection } from "@shopify/hydrogen";
import type { CustomerAddressInput } from "@shopify/hydrogen/customer-account-api-types";
import { type ActionFunction, json, redirect } from "@shopify/remix-oxygen";
import invariant from "tiny-invariant";
import Button from "~/components/button";
import {
  CREATE_ADDRESS_MUTATION,
  DELETE_ADDRESS_MUTATION,
  UPDATE_ADDRESS_MUTATION,
} from "~/graphql/customer-account/customer-address-mutations";
import { getInputStyleClasses } from "~/lib/utils";
import type { AccountOutletContext } from "./($locale).account.edit";
import { doLogout } from "./($locale).account_.logout";

interface ActionData {
  formError?: string;
}

export const handle = {
  renderInModal: true,
};

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
      const { data, errors } = await customerAccount.mutate(
        DELETE_ADDRESS_MUTATION,
        { variables: { addressId } },
      );

      invariant(!errors?.length, errors?.[0]?.message);

      invariant(
        !data?.customerAddressDelete?.userErrors?.length,
        data?.customerAddressDelete?.userErrors?.[0]?.message,
      );

      return redirect(
        params?.locale ? `${params?.locale}/account` : "/account",
      );
    } catch (error: any) {
      return json(
        { formError: error.message },
        {
          status: 400,
        },
      );
    }
  }

  const address: CustomerAddressInput = {};

  const keys: (keyof CustomerAddressInput)[] = [
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

  for (const key of keys) {
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
      const { data, errors } = await customerAccount.mutate(
        CREATE_ADDRESS_MUTATION,
        { variables: { address, defaultAddress } },
      );

      invariant(!errors?.length, errors?.[0]?.message);

      invariant(
        !data?.customerAddressCreate?.userErrors?.length,
        data?.customerAddressCreate?.userErrors?.[0]?.message,
      );

      invariant(
        data?.customerAddressCreate?.customerAddress?.id,
        "Expected customer address to be created",
      );

      return redirect(
        params?.locale ? `${params?.locale}/account` : "/account",
      );
    } catch (error: any) {
      return json(
        { formError: error.message },
        {
          status: 400,
        },
      );
    }
  } else {
    try {
      const { data, errors } = await customerAccount.mutate(
        UPDATE_ADDRESS_MUTATION,
        {
          variables: {
            address,
            addressId,
            defaultAddress,
          },
        },
      );

      invariant(!errors?.length, errors?.[0]?.message);

      invariant(
        !data?.customerAddressUpdate?.userErrors?.length,
        data?.customerAddressUpdate?.userErrors?.[0]?.message,
      );

      return redirect(
        params?.locale ? `${params?.locale}/account` : "/account",
      );
    } catch (error: any) {
      return json(
        { formError: error.message },
        {
          status: 400,
        },
      );
    }
  }
};

export default function EditAddress() {
  const { id: addressId } = useParams();
  const isNewAddress = addressId === "add";
  const actionData = useActionData<ActionData>();
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
  const address = addresses.find((address) =>
    address.id?.startsWith(normalizedAddress),
  );

  return (
    <>
      <div className="mt-4 mb-6 text-xl">
        {isNewAddress ? "Add new address" : "Edit address"}
      </div>
      <div className="max-w-lg">
        <Form method="post">
          <input
            type="hidden"
            name="addressId"
            value={address?.id ?? addressId}
          />
          {actionData?.formError && (
            <div className="flex items-center justify-center mb-6 bg-red-100 rounded">
              <p className="m-4 text-red-900">{actionData.formError}</p>
            </div>
          )}
          <div className="mt-3">
            <input
              className={getInputStyleClasses()}
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
          <div className="mt-3">
            <input
              className={getInputStyleClasses()}
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
          <div className="mt-3">
            <input
              className={getInputStyleClasses()}
              id="company"
              name="company"
              type="text"
              autoComplete="organization"
              placeholder="Company"
              aria-label="Company"
              defaultValue={address?.company ?? ""}
            />
          </div>
          <div className="mt-3">
            <input
              className={getInputStyleClasses()}
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
          <div className="mt-3">
            <input
              className={getInputStyleClasses()}
              id="address2"
              name="address2"
              type="text"
              autoComplete="address-line2"
              placeholder="Address line 2"
              aria-label="Address line 2"
              defaultValue={address?.address2 ?? ""}
            />
          </div>
          <div className="mt-3">
            <input
              className={getInputStyleClasses()}
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
          <div className="mt-3">
            <input
              className={getInputStyleClasses()}
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
          <div className="mt-3">
            <input
              className={getInputStyleClasses()}
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
          <div className="mt-3">
            <input
              className={getInputStyleClasses()}
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
          <div className="mt-3">
            <input
              className={getInputStyleClasses()}
              id="phone"
              name="phoneNumber"
              type="tel"
              autoComplete="tel"
              placeholder="Phone"
              aria-label="Phone"
              defaultValue={address?.phoneNumber ?? ""}
            />
          </div>
          <div className="mt-4">
            <input
              type="checkbox"
              name="defaultAddress"
              id="defaultAddress"
              defaultChecked={defaultAddress?.id === address?.id}
              className="border-gray-500 rounded-sm cursor-pointer border-1"
            />
            <label
              className="inline-block ml-2 cursor-pointer"
              htmlFor="defaultAddress"
            >
              Set as default address
            </label>
          </div>
          <div className="mt-6 flex gap-3 items-center justify-end">
            <Button link=".." className="mb-2 px-4" variant="secondary">
              Cancel
            </Button>
            <Button
              className="mb-2"
              type="submit"
              variant="primary"
              disabled={state !== "idle"}
            >
              {state !== "idle" ? "Saving" : "Save"}
            </Button>
          </div>
        </Form>
      </div>
    </>
  );
}
