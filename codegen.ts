import type { CodegenConfig } from "@graphql-codegen/cli";
import { getSchema, pluckConfig, preset } from "@shopify/hydrogen-codegen";

export default {
  overwrite: true,
  pluckConfig,
  generates: {
    "storefront-api.generated.d.ts": {
      preset,
      schema: getSchema("storefront"),
      documents: [
        "./*.{ts,tsx,js,jsx}",
        "./app/**/*.{ts,tsx,js,jsx}",
        "!./app/routes/*.account*.{ts,tsx,js,jsx}",
      ],
    },
    "customer-account-api.generated.d.ts": {
      preset,
      schema: [getSchema("customer-account")],
      documents: ["./app/routes/*.account*.{ts,tsx,js,jsx}"],
    },
  },
} as CodegenConfig;
