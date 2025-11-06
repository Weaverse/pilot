import type { CustomerAddressInput } from "@shopify/hydrogen/customer-account-api-types";
import type {
  AddressPartialFragment,
  CustomerDetailsFragment,
} from "customer-account-api.generated";
import {
  type ActionFunctionArgs,
  data,
  type Fetcher,
  Form,
  type LoaderFunctionArgs,
  type MetaFunction,
  useActionData,
  useNavigation,
  useOutletContext,
} from "react-router";
import { Button } from "~/components/button";
import { Section } from "~/components/section";
import {
  CREATE_ADDRESS_MUTATION,
  DELETE_ADDRESS_MUTATION,
  UPDATE_ADDRESS_MUTATION,
} from "./address-mutation-queries";

export type ActionResponse = {
  addressId?: string | null;
  createdAddress?: AddressPartialFragment;
  defaultAddress?: string | null;
  deletedAddress?: string | null;
  error: Record<AddressPartialFragment["id"], string> | null;
  updatedAddress?: AddressPartialFragment;
};

export const meta: MetaFunction = () => {
  return [{ title: "Addresses" }];
};

export async function loader({ context }: LoaderFunctionArgs) {
  await context.customerAccount.handleAuthStatus();

  return {};
}

export async function action({ request, context }: ActionFunctionArgs) {
  const { customerAccount } = context;

  try {
    const form = await request.formData();

    const addressId = form.has("addressId")
      ? String(form.get("addressId"))
      : null;
    if (!addressId) {
      throw new Error("You must provide an address id.");
    }

    // this will ensure redirecting to login never happen for mutation
    const isLoggedIn = await customerAccount.isLoggedIn();
    if (!isLoggedIn) {
      return data(
        { error: { [addressId]: "Unauthorized" } },
        {
          status: 401,
        },
      );
    }

    const defaultAddress = form.has("defaultAddress")
      ? String(form.get("defaultAddress")) === "on"
      : false;
    const address: CustomerAddressInput = {};
    const keys: (keyof CustomerAddressInput)[] = [
      "address1",
      "address2",
      "city",
      "company",
      "territoryCode",
      "firstName",
      "lastName",
      "phoneNumber",
      "zoneCode",
      "zip",
    ];

    for (const key of keys) {
      const value = form.get(key);
      if (typeof value === "string") {
        address[key] = value;
      }
    }

    switch (request.method) {
      case "POST": {
        // handle new address creation
        try {
          const { data: createData, errors } = await customerAccount.mutate(
            CREATE_ADDRESS_MUTATION,
            {
              variables: { address, defaultAddress },
            },
          );

          if (errors?.length) {
            throw new Error(errors[0].message);
          }

          if (createData?.customerAddressCreate?.userErrors?.length) {
            throw new Error(
              createData?.customerAddressCreate?.userErrors[0].message,
            );
          }

          if (!createData?.customerAddressCreate?.customerAddress) {
            throw new Error("Customer address create failed.");
          }

          return {
            error: null,
            createdAddress: createData?.customerAddressCreate?.customerAddress,
            defaultAddress,
          };
        } catch (error: unknown) {
          if (error instanceof Error) {
            return data(
              { error: { [addressId]: error.message } },
              {
                status: 400,
              },
            );
          }
          return data(
            { error: { [addressId]: error } },
            {
              status: 400,
            },
          );
        }
      }

      case "PUT": {
        // handle address updates
        try {
          const { data: updateData, errors } = await customerAccount.mutate(
            UPDATE_ADDRESS_MUTATION,
            {
              variables: {
                address,
                addressId: decodeURIComponent(addressId),
                defaultAddress,
              },
            },
          );

          if (errors?.length) {
            throw new Error(errors[0].message);
          }

          if (updateData?.customerAddressUpdate?.userErrors?.length) {
            throw new Error(
              updateData?.customerAddressUpdate?.userErrors[0].message,
            );
          }

          if (!updateData?.customerAddressUpdate?.userErrors?.length) {
            throw new Error("Customer address update failed.");
          }

          return {
            error: null,
            updatedAddress: address,
            defaultAddress,
          };
        } catch (error: unknown) {
          if (error instanceof Error) {
            return data(
              { error: { [addressId]: error.message } },
              {
                status: 400,
              },
            );
          }
          return data(
            { error: { [addressId]: error } },
            {
              status: 400,
            },
          );
        }
      }

      case "DELETE": {
        // handles address deletion
        try {
          const { data: delateData, errors } = await customerAccount.mutate(
            DELETE_ADDRESS_MUTATION,
            {
              variables: { addressId: decodeURIComponent(addressId) },
            },
          );

          if (errors?.length) {
            throw new Error(errors[0].message);
          }

          if (delateData?.customerAddressDelete?.userErrors?.length) {
            throw new Error(
              delateData?.customerAddressDelete?.userErrors[0].message,
            );
          }

          if (!delateData?.customerAddressDelete?.deletedAddressId) {
            throw new Error("Customer address delete failed.");
          }

          return { error: null, deletedAddress: addressId };
        } catch (error: unknown) {
          if (error instanceof Error) {
            return data(
              { error: { [addressId]: error.message } },
              {
                status: 400,
              },
            );
          }
          return data(
            { error: { [addressId]: error } },
            {
              status: 400,
            },
          );
        }
      }

      default: {
        return data(
          { error: { [addressId]: "Method not allowed" } },
          {
            status: 405,
          },
        );
      }
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      return data(
        { error: error.message },
        {
          status: 400,
        },
      );
    }
    return data(
      { error },
      {
        status: 400,
      },
    );
  }
}

export default function Addresses() {
  const { customer } = useOutletContext<{
    customer: CustomerDetailsFragment;
  }>();
  const { defaultAddress, addresses } = customer;

  return (
    <Section
      width="fixed"
      verticalPadding="medium"
      containerClassName="space-y-10"
    >
      <div className="space-y-8">
        <div className="space-y-4">
          <h1 className="h4">Addresses</h1>
        </div>
        {addresses.edges.length ? (
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-lg">Add New Address</h3>
              <NewAddressForm />
            </div>
            <div className="border-border border-t" />
            <ExistingAddresses
              addresses={addresses}
              defaultAddress={defaultAddress}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-body-subtle">You have no addresses saved.</p>
            <NewAddressForm />
          </div>
        )}
      </div>
    </Section>
  );
}

function NewAddressForm() {
  const newAddress = {
    address1: "",
    address2: "",
    city: "",
    company: "",
    territoryCode: "",
    firstName: "",
    id: "new",
    lastName: "",
    phoneNumber: "",
    zoneCode: "",
    zip: "",
  } as CustomerAddressInput;

  return (
    <AddressForm
      addressId={"NEW_ADDRESS_ID"}
      address={newAddress}
      defaultAddress={null}
    >
      {({ stateForMethod }) => (
        <div className="flex gap-3">
          <Button
            variant="primary"
            disabled={stateForMethod("POST") !== "idle"}
            type="submit"
          >
            {stateForMethod("POST") !== "idle" ? "Creating..." : "Add Address"}
          </Button>
        </div>
      )}
    </AddressForm>
  );
}

function ExistingAddresses({
  addresses,
  defaultAddress,
}: Pick<CustomerDetailsFragment, "addresses" | "defaultAddress">) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg">Saved Addresses</h3>
      <div className="grid gap-6 md:grid-cols-2">
        {addresses.edges.map(({ node: address }) => (
          <AddressForm
            key={address.id}
            addressId={address.id}
            address={address}
            defaultAddress={defaultAddress}
          >
            {({ stateForMethod }) => (
              <div className="flex gap-3">
                <Button
                  disabled={stateForMethod("PUT") !== "idle"}
                  variant="primary"
                  type="submit"
                >
                  {stateForMethod("PUT") !== "idle" ? "Saving..." : "Save"}
                </Button>
                <Button
                  disabled={stateForMethod("DELETE") !== "idle"}
                  type="submit"
                  variant="outline"
                >
                  {stateForMethod("DELETE") !== "idle"
                    ? "Deleting..."
                    : "Delete"}
                </Button>
              </div>
            )}
          </AddressForm>
        ))}
      </div>
    </div>
  );
}

export function AddressForm({
  addressId,
  address,
  defaultAddress,
  children,
}: {
  addressId: AddressPartialFragment["id"];
  address: CustomerAddressInput;
  defaultAddress: CustomerDetailsFragment["defaultAddress"];
  children: (props: {
    stateForMethod: (method: "PUT" | "POST" | "DELETE") => Fetcher["state"];
  }) => React.ReactNode;
}) {
  const { state, formMethod } = useNavigation();
  const actionData = useActionData<ActionResponse>();
  const error = actionData?.error?.[addressId];
  const isDefaultAddress = defaultAddress?.id === addressId;
  return (
    <Form id={addressId} className="border border-gray-300 p-6">
      <fieldset className="space-y-4">
        <input type="hidden" name="addressId" defaultValue={addressId} />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="firstName" className="mb-1">
              First name*
            </label>
            <input
              aria-label="First name"
              autoComplete="given-name"
              defaultValue={address?.firstName ?? ""}
              id="firstName"
              name="firstName"
              placeholder="First name"
              required
              type="text"
              className="w-full border border-border bg-background px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="mb-1">
              Last name*
            </label>
            <input
              aria-label="Last name"
              autoComplete="family-name"
              defaultValue={address?.lastName ?? ""}
              id="lastName"
              name="lastName"
              placeholder="Last name"
              required
              type="text"
              className="w-full border border-border bg-background px-3 py-2"
            />
          </div>
        </div>
        <div>
          <label htmlFor="company" className="mb-1">
            Company
          </label>
          <input
            aria-label="Company"
            autoComplete="organization"
            defaultValue={address?.company ?? ""}
            id="company"
            name="company"
            placeholder="Company"
            type="text"
            className="w-full border border-border bg-background px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="address1" className="mb-1">
            Address line*
          </label>
          <input
            aria-label="Address line 1"
            autoComplete="address-line1"
            defaultValue={address?.address1 ?? ""}
            id="address1"
            name="address1"
            placeholder="Address line 1*"
            required
            type="text"
            className="w-full border border-border bg-background px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="address2" className="mb-1">
            Address line 2
          </label>
          <input
            aria-label="Address line 2"
            autoComplete="address-line2"
            defaultValue={address?.address2 ?? ""}
            id="address2"
            name="address2"
            placeholder="Address line 2"
            type="text"
            className="w-full border border-border bg-background px-3 py-2"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="city" className="mb-1">
              City*
            </label>
            <input
              aria-label="City"
              autoComplete="address-level2"
              defaultValue={address?.city ?? ""}
              id="city"
              name="city"
              placeholder="City"
              required
              type="text"
              className="w-full border border-border bg-background px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="zoneCode" className="mb-1">
              State / Province*
            </label>
            <input
              aria-label="State/Province"
              autoComplete="address-level1"
              defaultValue={address?.zoneCode ?? ""}
              id="zoneCode"
              name="zoneCode"
              placeholder="State / Province"
              required
              type="text"
              className="w-full border border-border bg-background px-3 py-2"
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="zip" className="mb-1">
              Zip / Postal Code*
            </label>
            <input
              aria-label="Zip"
              autoComplete="postal-code"
              defaultValue={address?.zip ?? ""}
              id="zip"
              name="zip"
              placeholder="Zip / Postal Code"
              required
              type="text"
              className="w-full border border-border bg-background px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="territoryCode" className="mb-1">
              Country Code*
            </label>
            <input
              aria-label="territoryCode"
              autoComplete="country"
              defaultValue={address?.territoryCode ?? ""}
              id="territoryCode"
              name="territoryCode"
              placeholder="Country"
              required
              type="text"
              maxLength={2}
              className="w-full border border-border bg-background px-3 py-2"
            />
          </div>
        </div>
        <div>
          <label htmlFor="phoneNumber" className="mb-1">
            Phone
          </label>
          <input
            aria-label="Phone Number"
            autoComplete="tel"
            defaultValue={address?.phoneNumber ?? ""}
            id="phoneNumber"
            name="phoneNumber"
            placeholder="+16135551111"
            pattern="^\+?[1-9]\d{3,14}$"
            type="tel"
            className="w-full border border-border bg-background px-3 py-2"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            defaultChecked={isDefaultAddress}
            id="defaultAddress"
            name="defaultAddress"
            type="checkbox"
            className="h-4 w-4 rounded border-border"
          />
          <label htmlFor="defaultAddress" className="">
            Set as default address
          </label>
        </div>
        {error && <p className="text-red-600">{error}</p>}
        {children({
          stateForMethod: (method) => (formMethod === method ? state : "idle"),
        })}
      </fieldset>
    </Form>
  );
}
