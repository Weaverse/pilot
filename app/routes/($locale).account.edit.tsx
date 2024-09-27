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
import invariant from "tiny-invariant";
import Button from "~/components/button";
import { CUSTOMER_UPDATE_MUTATION } from "~/graphql/customer-account/customer-update-mutation";
import { getInputStyleClasses } from "~/lib/utils";
import { Text } from "~/modules/text";
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

const formDataHas = (formData: FormData, key: string) => {
  if (!formData.has(key)) return false;

  const value = formData.get(key);
  return typeof value === "string" && value.length > 0;
};

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

    formDataHas(formData, "firstName") &&
      (customer.firstName = formData.get("firstName") as string);
    formDataHas(formData, "lastName") &&
      (customer.lastName = formData.get("lastName") as string);

    const { data, errors } = await context.customerAccount.mutate(
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
  const actionData = useActionData<ActionData>();
  const { customer } = useOutletContext<AccountOutletContext>();
  const { state } = useNavigation();

  return (
    <>
      <div className="mt-4 mb-6 text-xl">Edit account</div>
      <Form method="post">
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
            type="text"
            autoComplete="given-name"
            placeholder="First name"
            aria-label="First name"
            defaultValue={customer.firstName ?? ""}
          />
        </div>
        <div className="mt-3">
          <input
            className={getInputStyleClasses()}
            id="lastName"
            name="lastName"
            type="text"
            autoComplete="family-name"
            placeholder="Last name"
            aria-label="Last name"
            defaultValue={customer.lastName ?? ""}
          />
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
    </>
  );
}
