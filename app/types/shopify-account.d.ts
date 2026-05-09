import type React from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "shopify-store": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          "store-domain"?: string;
          "public-access-token"?: string;
          "customer-access-token"?: string;
        },
        HTMLElement
      >;
      "shopify-account": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          "sign-in-url"?: string;
        },
        HTMLElement
      >;
    }
  }
}
