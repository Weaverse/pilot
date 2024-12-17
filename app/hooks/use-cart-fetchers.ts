import { useFetchers } from "@remix-run/react";
import { CartForm } from "@shopify/hydrogen";

export function useCartFetchers(actionName: string) {
  let fetchers = useFetchers();
  let cartFetchers = [];

  for (let fetcher of fetchers) {
    if (fetcher.formData) {
      let formInputs = CartForm.getFormInput(fetcher.formData);
      if (formInputs.action === actionName) {
        cartFetchers.push(fetcher);
      }
    }
  }
  return cartFetchers;
}
