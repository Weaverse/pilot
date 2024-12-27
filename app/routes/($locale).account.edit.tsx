import {
  Form,
  useActionData,
  useNavigation,
  useOutletContext,
} from "@remix-run/react";
import type {
  Customer,
  CustomerUpdateInput,
} from "@shopify/hydrogen/customer-account-api-types";
import { type ActionFunction, json, redirect } from "@shopify/remix-oxygen";
import type { CustomerUpdateMutation } from "customer-account-api.generated";
import invariant from "tiny-invariant";
import { Button } from "~/components/button";
import Link from "~/components/link";
import { doLogout } from "./($locale).account_.logout";

export interface AccountOutletContext {
  customer: Customer;
}

export interface ActionData {
  success?: boolean;
  formError?: string;
  fieldErrors?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    currentPassword?: string;
    newPassword?: string;
    newPassword2?: string;
  };
}

function formDataHas(formData: FormData, key: string) {
  if (!formData.has(key)) return false;

  let value = formData.get(key);
  return typeof value === "string" && value.length > 0;
}

export let handle = {
  renderInModal: true,
};

export let action: ActionFunction = async ({ request, context, params }) => {
  let formData = await request.formData();

  // Double-check current user is logged in.
  // Will throw a logout redirect if not.
  if (!(await context.customerAccount.isLoggedIn())) {
    throw await doLogout(context);
  }

  try {
    let customer: CustomerUpdateInput = {};

    if (formDataHas(formData, "firstName")) {
      customer.firstName = formData.get("firstName") as string;
    }
    if (formDataHas(formData, "lastName")) {
      customer.lastName = formData.get("lastName") as string;
    }

    let { data, errors } =
      await context.customerAccount.mutate<CustomerUpdateMutation>(
        CUSTOMER_UPDATE_MUTATION,
        {
          variables: {
            customer,
          },
        },
      );

    invariant(!errors?.length, errors?.[0]?.message);

    invariant(
      !data?.customerUpdate?.userErrors?.length,
      data?.customerUpdate?.userErrors?.[0]?.message,
    );

    return redirect(params?.locale ? `${params.locale}/account` : "/account");
  } catch (error: any) {
    return json(
      { formError: error?.message },
      {
        status: 400,
      },
    );
  }
};

/**
 * Since this component is nested in `accounts/`, it is rendered in a modal via `<Outlet>` in `account.tsx`.
 *
 * This allows us to:
 * - preserve URL state (`/accounts/edit` when the modal is open)
 * - co-locate the edit action with the edit form (rather than grouped in account.tsx)
 * - use the `useOutletContext` hook to access the customer data from the parent route (no additional data loading)
 * - return a simple `redirect()` from this action to close the modal :mindblown: (no useState/useEffect)
 * - use the presence of outlet data (in `account.tsx`) to open/close the modal (no useState)
 */
export default function AccountDetailsEdit() {
  let actionData = useActionData<ActionData>();
  let { customer } = useOutletContext<AccountOutletContext>();
  let { state } = useNavigation();

  return (
    <div className="space-y-2">
      <div className="text-xl py-2.5">Edit account</div>
      <Form method="post" className="space-y-3">
        {actionData?.formError && (
          <div className="flex items-center justify-center bg-red-100 text-red-900 p-3">
            {actionData.formError}
          </div>
        )}
        <input
          id="firstName"
          name="firstName"
          className="appearance-none border border-line p-3 focus:outline-none w-full"
          type="text"
          autoComplete="given-name"
          placeholder="First name"
          aria-label="First name"
          defaultValue={customer.firstName ?? ""}
        />
        <input
          id="lastName"
          name="lastName"
          className="appearance-none border border-line p-3 focus:outline-none w-full"
          type="text"
          autoComplete="family-name"
          placeholder="Last name"
          aria-label="Last name"
          defaultValue={customer.lastName ?? ""}
        />
        <div className="py-2.5 flex gap-6 items-center justify-end">
          <Link to="/account" className="hover:underline underline-offset-4">
            Cancel
          </Link>
          <Button type="submit" variant="primary" disabled={state !== "idle"}>
            {state !== "idle" ? "Saving" : "Save"}
          </Button>
        </div>
      </Form>
    </div>
  );
}

const CUSTOMER_UPDATE_MUTATION = `#graphql
  mutation customerUpdate($customer: CustomerUpdateInput!) {
    customerUpdate(input: $customer) {
      userErrors {
        code
        field
        message
      }
    }
  }
`;
