import type { CustomerAddressInput } from "@shopify/hydrogen/customer-account-api-types";
import { type ActionFunction, data, redirect } from "@shopify/remix-oxygen";
import type {
  CustomerAddressCreateMutation,
  CustomerAddressDeleteMutation,
  CustomerAddressUpdateMutation,
} from "customer-account-api.generated";
import invariant from "tiny-invariant";
// biome-ignore lint/style/noExportedImports: <explanation> --- IGNORE ---
import { AccountEditAddressForm } from "~/components/customer/edit-address-form";
import { doLogout } from "./($locale).account_.logout";

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
      const { data: deleteData, errors } =
        await customerAccount.mutate<CustomerAddressDeleteMutation>(
          DELETE_ADDRESS_MUTATION,
          { variables: { addressId } },
        );

      invariant(!errors?.length, errors?.[0]?.message);

      invariant(
        !deleteData?.customerAddressDelete?.userErrors?.length,
        deleteData?.customerAddressDelete?.userErrors?.[0]?.message,
      );

      return redirect(
        params?.locale ? `${params?.locale}/account` : "/account",
      );
    } catch (error: any) {
      return data(
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
      const { data: createData, errors } =
        await customerAccount.mutate<CustomerAddressCreateMutation>(
          CREATE_ADDRESS_MUTATION,
          { variables: { address, defaultAddress } },
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
    } catch (error: any) {
      return data(
        { formError: error.message },
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
    } catch (error: any) {
      return data(
        { formError: error.message },
        {
          status: 400,
        },
      );
    }
  }
};

export default AccountEditAddressForm;

// NOTE: https://shopify.dev/docs/api/customer/latest/mutations/customerAddressUpdate
export const UPDATE_ADDRESS_MUTATION = `#graphql
  mutation customerAddressUpdate(
    $address: CustomerAddressInput!
    $addressId: ID!
    $defaultAddress: Boolean
 ) {
    customerAddressUpdate(
      address: $address
      addressId: $addressId
      defaultAddress: $defaultAddress
    ) {
      userErrors {
        code
        field
        message
      }
    }
  }
` as const;

// NOTE: https://shopify.dev/docs/api/customer/latest/mutations/customerAddressDelete
export const DELETE_ADDRESS_MUTATION = `#graphql
  mutation customerAddressDelete(
    $addressId: ID!,
  ) {
    customerAddressDelete(addressId: $addressId) {
      deletedAddressId
      userErrors {
        code
        field
        message
      }
    }
  }
` as const;

// NOTE: https://shopify.dev/docs/api/customer/latest/mutations/customerAddressCreate
export const CREATE_ADDRESS_MUTATION = `#graphql
  mutation customerAddressCreate(
    $address: CustomerAddressInput!
    $defaultAddress: Boolean
  ) {
    customerAddressCreate(
      address: $address
      defaultAddress: $defaultAddress
    ) {
      customerAddress {
        id
      }
      userErrors {
        code
        field
        message
      }
    }
  }
` as const;
