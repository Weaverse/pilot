import type { CustomerUpdateInput } from "@shopify/hydrogen/customer-account-api-types";
import type { CustomerUpdateMutation } from "customer-account-api.generated";
import {
  type ActionFunctionArgs,
  data,
  Form,
  type LoaderFunctionArgs,
  type MetaFunction,
  useActionData,
  useNavigation,
  useOutletContext,
} from "react-router";
import { Button } from "~/components/button";
import { Section } from "~/components/section";

// https://shopify.dev/docs/api/customer/latest/mutations/customerUpdate
export const CUSTOMER_UPDATE_MUTATION = `#graphql
  mutation customerUpdate(
    $customer: CustomerUpdateInput!
    $language: LanguageCode
  ) @inContext(language: $language) {
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
          language: customerAccount.i18n.language,
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
  } catch (error: unknown) {
    return data(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        customer: null,
      },
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
    <Section
      width="fixed"
      verticalPadding="medium"
      containerClassName="space-y-10"
    >
      <div className="space-y-6">
        <div className="space-y-4">
          <h1 className="h4 font-medium">Personal Information</h1>
        </div>
        <Form method="PUT" className="space-y-6">
          <fieldset className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="firstName" className="">
                First name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                placeholder="First name"
                aria-label="First name"
                defaultValue={customer.firstName ?? ""}
                minLength={2}
                className="w-full border border-border bg-background px-3 py-2"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="lastName" className="">
                Last name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                placeholder="Last name"
                aria-label="Last name"
                defaultValue={customer.lastName ?? ""}
                minLength={2}
                className="w-full border border-border bg-background px-3 py-2"
              />
            </div>
          </fieldset>
          {actionData?.error && (
            <p className="text-red-600 text-sm">{actionData.error}</p>
          )}
          <Button type="submit" disabled={state !== "idle"} variant="primary">
            {state !== "idle" ? "Updating..." : "Update Profile"}
          </Button>
        </Form>
      </div>
    </Section>
  );
}
