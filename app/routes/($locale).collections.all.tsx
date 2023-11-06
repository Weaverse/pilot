import {redirect} from '@shopify/remix-oxygen';
import {type RouteLoaderArgs} from '@weaverse/hydrogen';

export async function loader({params}: RouteLoaderArgs) {
  return redirect(params?.locale ? `${params.locale}/products` : '/products');
}
