import {Form, useActionData, type MetaFunction} from '@remix-run/react';
import {
  json,
  redirect,
  type ActionFunction,
  type LoaderFunctionArgs,
} from '@shopify/remix-oxygen';
import {useState, type MouseEvent} from 'react';

import {Button, Input, Link} from '~/components';

import {doLogin} from './($locale).account.login';

export async function loader({context, params}: LoaderFunctionArgs) {
  const customerAccessToken = await context.session.get('customerAccessToken');

  if (customerAccessToken) {
    return redirect(params.locale ? `${params.locale}/account` : '/account');
  }

  return new Response(null);
}

type ActionData = {
  formError?: string;
};

const badRequest = (data: ActionData) => json(data, {status: 400});

export const action: ActionFunction = async ({request, context, params}) => {
  const {session, storefront} = context;
  const formData = await request.formData();

  const email = formData.get('email');
  const password = formData.get('password');

  if (
    !email ||
    !password ||
    typeof email !== 'string' ||
    typeof password !== 'string'
  ) {
    return badRequest({
      formError: 'Please provide both an email and a password.',
    });
  }

  try {
    const data = await storefront.mutate(CUSTOMER_CREATE_MUTATION, {
      variables: {
        input: {email, password},
      },
    });

    if (!data?.customerCreate?.customer?.id) {
      /**
       * Something is wrong with the user's input.
       */
      throw new Error(data?.customerCreate?.customerUserErrors.join(', '));
    }

    const customerAccessToken = await doLogin(context, {email, password});
    session.set('customerAccessToken', customerAccessToken);

    return redirect(params.locale ? `${params.locale}/account` : '/account', {
      headers: {
        'Set-Cookie': await session.commit(),
      },
    });
  } catch (error: any) {
    if (storefront.isApiError(error)) {
      return badRequest({
        formError: 'Something went wrong. Please try again later.',
      });
    }

    /**
     * The user did something wrong, but the raw error from the API is not super friendly.
     * Let's make one up.
     */
    return badRequest({
      formError:
        'Sorry. We could not create an account with this email. User might already exist, try to login instead.',
    });
  }
};

export const meta: MetaFunction = () => {
  return [{title: 'Register'}];
};

export default function Register() {
  const actionData = useActionData<ActionData>();
  const [nativeEmailError, setNativeEmailError] = useState<null | string>(null);
  const [nativePasswordError, setNativePasswordError] = useState<null | string>(
    null,
  );

  return (
    <div className="flex justify-center my-24 px-4">
      <div className="max-w-sm w-full">
        <h2 className="text-center">Create account</h2>
        {/* TODO: Add onSubmit to validate _before_ submission with native? */}
        <Form method="post" noValidate className="pt-6 pb-8 mt-4 mb-4">
          {actionData?.formError && (
            <div className="flex items-center justify-center mb-6 bg-zinc-500">
              <p className="m-4 text-s text-contrast">{actionData.formError}</p>
            </div>
          )}
          <div className="space-y-3">
            <div>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="Email"
                aria-label="Email"
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
            <div>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Password"
                aria-label="Password"
                minLength={8}
                required
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
                onBlur={(event: MouseEvent<HTMLInputElement>) => {
                  if (
                    event.currentTarget.validity.valid ||
                    !event.currentTarget.value.length
                  ) {
                    setNativePasswordError(null);
                  } else {
                    setNativePasswordError(
                      event.currentTarget.validity.valueMissing
                        ? 'Please enter a password'
                        : 'Passwords must be at least 8 characters',
                    );
                  }
                }}
              />
              {nativePasswordError && (
                <p className="text-red-500 text-xs">
                  {' '}
                  {nativePasswordError} &nbsp;
                </p>
              )}
            </div>
          </div>
          <div className="mt-8 flex flex-col items-center justify-center gap-6">
            <Button
              type="submit"
              disabled={!!(nativePasswordError || nativeEmailError)}
            >
              Create account
            </Button>
            <div className="flex items-center">
              <p className="align-baseline text-sm">
                Already have an account? &nbsp;
                <Link className="inline underline" to="/account/login">
                  Log in here
                </Link>
              </p>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}

const CUSTOMER_CREATE_MUTATION = `#graphql
  mutation customerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
        id
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;
