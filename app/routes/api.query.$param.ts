import { LoaderFunction, json } from '@remix-run/server-runtime';
import { getProductData } from "~/lib/products";

function getRequestQueries<T = Record<string, string>>(request: Request) {
  let url = new URL(request.url);
  return Array.from(url.searchParams.entries()).reduce((q, [k, v]) => {
    q[k] = v;
    return q;
  }, {}) as T;
}

export let loader: LoaderFunction = async ({request, params, context}) => {
  try {
    let queries = getRequestQueries(request);
    switch (params.param) {
      case 'products': {
        let handle = queries.handle;
        if (!handle) return json(null, {status: 404});
        let productData = await getProductData(
          context.storefront,
          String(handle),
        );
        return json(productData);
      }
      default:
        return json(null, {status: 404});
    }
  } catch (error) {
    console.error(error);
    return json({error: 'An error occurred'}, {status: 500});
  }
};