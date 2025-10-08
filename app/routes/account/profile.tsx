import type { CustomerUpdateInput } from "@shopify/hydrogen/customer-account-api-types";
import {
  type ActionFunctionArgs,
  data,
  type LoaderFunctionArgs,
} from "@shopify/remix-oxygen";
import type { CustomerUpdateMutation } from "customer-account-api.generated";
import {
  Form,
  type MetaFunction,
  useActionData,
  useNavigation,
  useOutletContext,
} from "react-router";

// https://shopify.dev/docs/api/customer/latest/mutations/customerUpdate
export const CUSTOMER_UPDATE_MUTATION = `#graphql
  mutation customerUpdate(
    $customer: CustomerUpdateInput!
  ){
    customerUpdate(input: $customer) {
      customer {
        firstName
        lastName
        emailAddress {
          emailAddress
        }
        phoneNumber {
          phoneNumber
        }
      }
      userErrors {
        code
        field
        message
      }
    }
  }
` as const;

export type ActionResponse = {
  error: string | null;
  customer: CustomerUpdateMutation["customerUpdate"]["customer"] | null;
};

export const meta: MetaFunction = () => {
  return [{ title: "Profile" }];
};

export async function loader({ context }: LoaderFunctionArgs) {
  await context.customerAccount.handleAuthStatus();

  return {};
}

export async function action({ request, context }: ActionFunctionArgs) {
  const { customerAccount } = context;

  if (request.method !== "PUT") {
    return data({ error: "Method not allowed" }, { status: 405 });
  }

  const form = await request.formData();

  try {
    const customer: CustomerUpdateInput = {};
    const validInputKeys = ["firstName", "lastName"] as const;
    for (const [key, value] of form.entries()) {
      if (!validInputKeys.includes(key as any)) {
        continue;
      }
      if (typeof value === "string" && value.length) {
        customer[key as (typeof validInputKeys)[number]] = value;
      }
    }

    // update customer and possibly password
    const { data: updateData, errors } = await customerAccount.mutate(
      CUSTOMER_UPDATE_MUTATION,
      {
        variables: {
          customer,
        },
      },
    );

    if (errors?.length) {
      throw new Error(errors[0].message);
    }

    if (!updateData?.customerUpdate?.customer) {
      throw new Error("Customer profile update failed.");
    }

    return {
      error: null,
      customer: updateData?.customerUpdate?.customer,
    };
  } catch (error: any) {
    return data(
      { error: error.message, customer: null },
      {
        status: 400,
      },
    );
  }
}

export default function AccountProfile() {
  const account = useOutletContext<{
    customer: CustomerUpdateMutation["customerUpdate"]["customer"];
  }>();
  const { state } = useNavigation();
  const actionData = useActionData<ActionResponse>();
  const customer = actionData?.customer ?? account?.customer;

  return (
    <div className="account-profile">
      <h2>My profile</h2>
      <br />
      <Form method="PUT">
        <legend>Personal information</legend>
        <fieldset>
          <label htmlFor="firstName">First name</label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            autoComplete="given-name"
            placeholder="First name"
            aria-label="First name"
            defaultValue={customer.firstName ?? ""}
            minLength={2}
          />
          <label htmlFor="lastName">Last name</label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            autoComplete="family-name"
            placeholder="Last name"
            aria-label="Last name"
            defaultValue={customer.lastName ?? ""}
            minLength={2}
          />
        </fieldset>
        {actionData?.error ? (
          <p>
            <mark>
              <small>{actionData.error}</small>
            </mark>
          </p>
        ) : (
          <br />
        )}
        <button type="submit" disabled={state !== "idle"}>
          {state !== "idle" ? "Updating" : "Update"}
        </button>
      </Form>
    </div>
  );
}
