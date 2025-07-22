import type {
  Customer,
  CustomerUpdateInput,
} from "@shopify/hydrogen/customer-account-api-types";
import { type ActionFunction, data, redirect } from "@shopify/remix-oxygen";
import type { CustomerUpdateMutation } from "customer-account-api.generated";
import {
  Form,
  useActionData,
  useNavigation,
  useOutletContext,
} from "react-router";
import invariant from "tiny-invariant";
import { Button } from "~/components/button";
import Link from "~/components/link";
import { CUSTOMER_UPDATE_MUTATION } from "./($locale).account.profile";
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
  if (!formData.has(key)) {
    return false;
  }

  const value = formData.get(key);
  return typeof value === "string" && value.length > 0;
}

export const handle = {
  renderInModal: true,
};

export const action: ActionFunction = async ({ request, context, params }) => {
  const formData = await request.formData();

  // Double-check current user is logged in.
  // Will throw a logout redirect if not.
  if (!(await context.customerAccount.isLoggedIn())) {
    throw await doLogout(context);
  }

  try {
    const customer: CustomerUpdateInput = {};

    if (formDataHas(formData, "firstName")) {
      customer.firstName = formData.get("firstName") as string;
    }
    if (formDataHas(formData, "lastName")) {
      customer.lastName = formData.get("lastName") as string;
    }

    const { data: updateData, errors } =
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
      !updateData?.customerUpdate?.userErrors?.length,
      updateData?.customerUpdate?.userErrors?.[0]?.message,
    );

    return redirect(params?.locale ? `${params.locale}/account` : "/account");
  } catch (error: any) {
    return data(
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
  const actionData = useActionData<ActionData>();
  const { customer } = useOutletContext<AccountOutletContext>();
  const { state } = useNavigation();

  return (
    <div className="space-y-2">
      <div className="py-2.5 text-xl">Edit account</div>
      <Form method="post" className="space-y-3">
        {actionData?.formError && (
          <div className="flex items-center justify-center bg-red-100 p-3 text-red-900">
            {actionData.formError}
          </div>
        )}
        <input
          id="firstName"
          name="firstName"
          className="w-full appearance-none border border-line p-3 focus:outline-hidden"
          type="text"
          autoComplete="given-name"
          placeholder="First name"
          aria-label="First name"
          defaultValue={customer.firstName ?? ""}
        />
        <input
          id="lastName"
          name="lastName"
          className="w-full appearance-none border border-line p-3 focus:outline-hidden"
          type="text"
          autoComplete="family-name"
          placeholder="Last name"
          aria-label="Last name"
          defaultValue={customer.lastName ?? ""}
        />
        <div className="flex items-center justify-end gap-6 py-2.5">
          <Link to="/account" className="underline-offset-4 hover:underline">
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
