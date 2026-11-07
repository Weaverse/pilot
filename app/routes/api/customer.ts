import {
  type GraphQLFormattedError,
  gql,
  type StorefrontApi,
} from "@shopify/hydrogen";
import type { ActionFunction, ActionFunctionArgs } from "react-router";
import { data } from "react-router";

const CUSTOMER_CREATE = gql(`#graphql
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
`);

type CustomerCreateMutation = StorefrontApi.ResultOf<typeof CUSTOMER_CREATE>;
type CustomerCreatePayload = NonNullable<
  CustomerCreateMutation["customerCreate"]
>;

export const action: ActionFunction = async ({
  request,
  context,
}: ActionFunctionArgs) => {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const { data: mutationData, errors: queryErrors } =
    await context.storefront.graphql(CUSTOMER_CREATE, {
      variables: {
        input: { email, password: "5hopify" },
      },
    });
  const customerCreate = mutationData?.customerCreate;

  const customer = customerCreate?.customer;
  const customerUserErrors = customerCreate?.customerUserErrors;

  if (queryErrors?.length) {
    return data(
      {
        errors: queryErrors,
        errorMessage: "Internal server error!",
        ok: false,
      },
      { status: 500 },
    );
  }
  if (customerUserErrors?.length) {
    return data(
      {
        errors: customerUserErrors,
        errorMessage: customerUserErrors?.[0]?.message,
        ok: false,
      },
      { status: 500 },
    );
  }
  if (customer) {
    return data({ customer, ok: true }, { status: 201 });
  }
  return data(
    {
      errorMessage: "Something went wrong! Please try again later.",
      ok: false,
    },
    { status: 500 },
  );
};

export type CustomerApiPlayLoad = {
  ok: boolean;
  customer?: CustomerCreatePayload["customer"] | null;
  errors?: Array<
    GraphQLFormattedError | CustomerCreatePayload["customerUserErrors"][number]
  >;
  errorMessage?: string;
};
