import type { GraphQLFormattedError } from "@shopify/hydrogen";
import { gql } from "@shopify/hydrogen/customer-account";
import type {
  CountryCode,
  CustomerAddressInput,
} from "@shopify/hydrogen/customer-account-api-types";

// `$language` is filled from the request's market by the client.

// NOTE: https://shopify.dev/docs/api/customer/latest/mutations/customerAddressUpdate
export const UPDATE_ADDRESS_MUTATION = gql(`#graphql
  mutation customerAddressUpdate(
    $address: CustomerAddressInput!
    $addressId: ID!
    $defaultAddress: Boolean
    $language: LanguageCode
  ) @inContext(language: $language) {
    customerAddressUpdate(
      address: $address
      addressId: $addressId
      defaultAddress: $defaultAddress
    ) {
      customerAddress {
        id
      }
      userErrors {
        code
        field
        message
      }
    }
  }
`);

// NOTE: https://shopify.dev/docs/api/customer/latest/mutations/customerAddressDelete
export const DELETE_ADDRESS_MUTATION = gql(`#graphql
  mutation customerAddressDelete(
    $addressId: ID!
    $language: LanguageCode
  ) @inContext(language: $language) {
    customerAddressDelete(addressId: $addressId) {
      deletedAddressId
      userErrors {
        code
        field
        message
      }
    }
  }
`);

// NOTE: https://shopify.dev/docs/api/customer/latest/mutations/customerAddressCreate
export const CREATE_ADDRESS_MUTATION = gql(`#graphql
  mutation customerAddressCreate(
    $address: CustomerAddressInput!
    $defaultAddress: Boolean
    $language: LanguageCode
  ) @inContext(language: $language) {
    customerAddressCreate(
      address: $address
      defaultAddress: $defaultAddress
    ) {
      customerAddress {
        id
      }
      userErrors {
        code
        field
        message
      }
    }
  }
`);

const ADDRESS_TEXT_KEYS = [
  "firstName",
  "lastName",
  "company",
  "address1",
  "address2",
  "city",
  "zoneCode",
  "zip",
  "phoneNumber",
] as const satisfies readonly (keyof CustomerAddressInput)[];

export const INVALID_COUNTRY_CODE_MESSAGE =
  "Enter a valid two-letter country code, such as US or GB.";

/**
 * The address a form submitted, as `CustomerAddressInput`.
 *
 * The 2026-10 Customer Account API takes `countryCode`, a `CountryCode` enum:
 * an upper-case two-letter code. GraphQL rejects any other value with a
 * validation error for the whole request, so the shopper's input is trimmed,
 * upper-cased and checked for shape here; Shopify checks that the country
 * exists. Throws with {@link INVALID_COUNTRY_CODE_MESSAGE} on a bad code.
 */
export function parseAddressForm(form: FormData): CustomerAddressInput {
  const address: CustomerAddressInput = {};
  for (const key of ADDRESS_TEXT_KEYS) {
    const value = form.get(key);
    if (typeof value === "string") {
      address[key] = value;
    }
  }
  const countryCode = form.get("countryCode");
  if (typeof countryCode === "string") {
    const code = countryCode.trim().toUpperCase();
    if (!/^[A-Z]{2}$/.test(code)) {
      throw new Error(INVALID_COUNTRY_CODE_MESSAGE);
    }
    address.countryCode = code as CountryCode;
  }
  return address;
}

/**
 * The message to show for a failed address mutation. An unknown `CountryCode`
 * fails variable validation with a message listing every valid code, so that
 * case shows {@link INVALID_COUNTRY_CODE_MESSAGE} instead.
 */
export function addressErrorMessage(
  errors: ReadonlyArray<GraphQLFormattedError>,
): string {
  const [error] = errors;
  const problems = error.extensions?.problems;
  const isCountryCodeProblem =
    Array.isArray(problems) &&
    problems.some(
      (problem: unknown) =>
        typeof problem === "object" &&
        problem !== null &&
        "path" in problem &&
        Array.isArray(problem.path) &&
        problem.path.at(-1) === "countryCode",
    );
  return isCountryCodeProblem ? INVALID_COUNTRY_CODE_MESSAGE : error.message;
}
