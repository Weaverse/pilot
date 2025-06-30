import { colord, extend } from "colord";
import namesPlugin from "colord/plugins/names";

extend([namesPlugin]);

export function constructURL(
  url: string,
  queries: Record<string, string | number | boolean> = {},
) {
  const _url = new URL(url);
  for (const [k, v] of Object.entries(queries)) {
    if (v !== undefined && v !== null) {
      _url.searchParams.set(k, v.toString());
    }
  }
  return _url.toString();
}

export function isValidColor(color: string) {
  const c = colord(color);
  return c.isValid();
}

export function isLightColor(color: string, threshold = 0.8) {
  const c = colord(color);
  return c.isValid() && c.brightness() > threshold;
}
