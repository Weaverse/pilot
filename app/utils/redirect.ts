import { redirect } from "@shopify/remix-oxygen";

export function redirectIfHandleIsLocalized(
  request: Request,
  ...localizedResources: Array<{
    handle: string;
    data: { handle: string } & unknown;
  }>
) {
  const url = new URL(request.url);
  let shouldRedirect = false;

  for (const { handle, data } of localizedResources) {
    if (handle !== data.handle) {
      url.pathname = url.pathname.replace(handle, data.handle);
      shouldRedirect = true;
    }
  }

  if (shouldRedirect) {
    throw redirect(url.toString());
  }
}
