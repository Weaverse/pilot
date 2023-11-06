import {
  json,
  redirect,
  type ActionFunction,
  type LoaderFunctionArgs,
} from '@shopify/remix-oxygen';
import {Form, useActionData, type MetaFunction} from '@remix-run/react';
import {useState, type MouseEvent} from 'react';

import {Button, Input, Link} from '~/components';

export async function loader({context, params}: LoaderFunctionArgs) {
  const customerAccessToken = await context.session.get('customerAccessToken');

  if (customerAccessToken) {
    return redirect(params.locale ? `${params.locale}/account` : '/account');
  }

  return new Response(null);
}

type ActionData = {
  formError?: string;
  resetRequested?: boolean;
};

const badRequest = (data: ActionData) => json(data, {status: 400});

export const action: ActionFunction = async ({request, context}) => {
  const formData = await request.formData();
  const email = formData.get('email');

  if (!email || typeof email !== 'string') {
    return badRequest({
      formError: 'Please provide an email.',
    });
  }

  try {
    await context.storefront.mutate(CUSTOMER_RECOVER_MUTATION, {
      variables: {email},
    });

    return json({resetRequested: true});
  } catch (error: any) {
    return badRequest({
      formError: 'Something went wrong. Please try again later.',
    });
  }
};

export const meta: MetaFunction = () => {
  return [{title: 'Recover Password'}];
};

export default function Recover() {
  const actionData = useActionData<ActionData>();
  const [nativeEmailError, setNativeEmailError] = useState<null | string>(null);
  const isSubmitted = actionData?.resetRequested;

  return (
    <div className="flex justify-center my-24 px-4">
      <div className="max-w-md w-full">
        {isSubmitted ? (
          <>
            <h2>Request Sent.</h2>
            <p className="mt-8">
              If that email address is in our system, you will receive an email
              with instructions about how to reset your password in a few
              minutes.
            </p>
          </>
        ) : (
          <>
            <h2>Reset your password</h2>
            <p className="mt-8 text-body/70">
              Enter your email to reset your password
            </p>
            {/* TODO: Add onSubmit to validate _before_ submission with native? */}
            <Form method="post" noValidate className="mt-4 pb-8 mb-4 space-y-8">
              {actionData?.formError && (
                <div className="flex items-center justify-center mb-6 bg-zinc-500">
                  <p className="m-4 text-s text-contrast">
                    {actionData.formError}
                  </p>
                </div>
              )}
              <div>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="Email address"
                  aria-label="Email address"
                  // eslint-disable-next-line jsx-a11y/no-autofocus
                  autoFocus
                  onBlur={(event: MouseEvent<HTMLInputElement>) => {
                    setNativeEmailError(
                      event.currentTarget.value.length &&
                        !event.currentTarget.validity.valid
                        ? 'Invalid email address'
                        : null,
                    );
                  }}
                />
                {nativeEmailError && (
                  <p className="text-red-500 text-xs">
                    {nativeEmailError} &nbsp;
                  </p>
                )}
              </div>
              <div className="flex items-center justify-center flex-col gap-6">
                <Button type="submit">Reset</Button>
                <div className="flex items-center">
                  <p className="align-baseline text-sm text-body/70">
                    Remember your password? &nbsp;
                    <Link className="inline underline" to="/account/login">
                      Back to Login
                    </Link>
                  </p>
                </div>
              </div>
            </Form>
          </>
        )}
      </div>
    </div>
  );
}

const CUSTOMER_RECOVER_MUTATION = `#graphql
  mutation customerRecover($email: String!) {
    customerRecover(email: $email) {
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;
