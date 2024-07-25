import type {
  ActionFunction,
  ActionFunctionArgs,
} from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import type { CustomerCreateMutation } from "storefrontapi.generated";

let CUSTOMER_CREATE = `#graphql
  mutation customerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
        firstName
        lastName
        email
        phone
        acceptsMarketing
      }
      customerUserErrors {
        field
        message
        code
      }
    }
  }
` as const;

export let action: ActionFunction = async ({
  request,
  context,
}: ActionFunctionArgs) => {
  let formData = await request.formData();
  let email = formData.get("email") as string;
  let { customerCreate, errors: queryErrors } =
    await context.storefront.mutate<CustomerCreateMutation>(CUSTOMER_CREATE, {
      variables: {
        input: { email, password: "5hopify" },
      },
    });

  let customer = customerCreate?.customer;
  let customerUserErrors = customerCreate?.customerUserErrors;

  if (queryErrors?.length) {
    return json(
      {
        errors: queryErrors,
        errorMessage: "Internal server error!",
        ok: false,
      },
      { status: 500 },
    );
  }
  if (customerUserErrors?.length) {
    return json(
      {
        errors: customerUserErrors,
        errorMessage: customerUserErrors?.[0]?.message,
        ok: false,
      },
      { status: 500 },
    );
  }
  if (customer) {
    return json({ customer, ok: true }, { status: 201 });
  }
  return json(
    {
      errorMessage: "Something went wrong! Please try again later.",
      ok: false,
    },
    { status: 500 },
  );
};

export type CustomerApiPlayLoad = {
  ok: boolean;
  customer?:
    | NonNullable<CustomerCreateMutation["customerCreate"]>["customer"]
    | null;
  errors?: any[];
  errorMessage?: string;
};
