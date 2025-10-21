import { graphiqlLoader } from "@shopify/hydrogen";
import { redirect } from "@shopify/remix-oxygen";
import type { LoaderFunctionArgs } from "react-router";

export async function loader(args: LoaderFunctionArgs) {
  if (process.env.NODE_ENV === "development") {
    // Default Hydrogen GraphiQL behavior
    return graphiqlLoader(args);
  }
  return redirect("/");
}
