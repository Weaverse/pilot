export function constructURL(
  url: string,
  queries: Record<string, string | number | boolean> = {},
) {
  let _url = new URL(url);
  for (let [k, v] of Object.entries(queries)) {
    if (v !== undefined && v !== null) {
      _url.searchParams.set(k, v.toString());
    }
  }
  return _url.toString();
}
