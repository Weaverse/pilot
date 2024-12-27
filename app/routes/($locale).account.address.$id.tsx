import type { CustomerAddressInput } from "@shopify/hydrogen/customer-account-api-types";
import { type ActionFunction, json, redirect } from "@shopify/remix-oxygen";
import invariant from "tiny-invariant";
import { AccountEditAddressForm } from "~/components/customer/edit-address-form";
import { doLogout } from "./($locale).account_.logout";
import type {
  CustomerAddressDeleteMutation,
  CustomerAddressCreateMutation,
  CustomerAddressUpdateMutation,
} from "customer-account-api.generated";

export let handle = {
  renderInModal: true,
};

export let action: ActionFunction = async ({ request, context, params }) => {
  let { customerAccount } = context;
  let formData = await request.formData();

  // Double-check current user is logged in.
  // Will throw a logout redirect if not.
  if (!(await customerAccount.isLoggedIn())) {
    throw await doLogout(context);
  }

  let addressId = formData.get("addressId");
  invariant(typeof addressId === "string", "You must provide an address id.");

  if (request.method === "DELETE") {
    try {
      let { data, errors } =
        await customerAccount.mutate<CustomerAddressDeleteMutation>(
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

  let address: CustomerAddressInput = {};

  let keys: (keyof CustomerAddressInput)[] = [
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

  for (let key of keys) {
    let value = formData.get(key);
    if (typeof value === "string") {
      address[key] = value;
    }
  }

  let defaultAddress = formData.has("defaultAddress")
    ? String(formData.get("defaultAddress")) === "on"
    : false;

  if (addressId === "add") {
    try {
      let { data, errors } =
        await customerAccount.mutate<CustomerAddressCreateMutation>(
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
      let { data, errors } =
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

export default AccountEditAddressForm;

// NOTE: https://shopify.dev/docs/api/customer/latest/mutations/customerAddressUpdate
const UPDATE_ADDRESS_MUTATION = `#graphql
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
const DELETE_ADDRESS_MUTATION = `#graphql
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
const CREATE_ADDRESS_MUTATION = `#graphql
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
