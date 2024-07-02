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
  let { storefront } = context;

  let { customerCreate, errors: queryError } =
    await storefront.mutate<CustomerCreateMutation>(CUSTOMER_CREATE, {
      variables: {
        input: { email, password: "5hopify" },
      },
    });
  let customer = customerCreate?.customer;
  let errors = customerCreate?.customerUserErrors || queryError;
  if (errors && errors.length) {
    return json({ errors }, { status: 200 });
  }
  return json({ customer }, { status: 201 });
};
