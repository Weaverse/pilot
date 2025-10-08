import { colord } from "colord";

export function constructURL(
  url: string,
  queries: Record<string, string | number | boolean> = {},
) {
  const fullUrl = url.startsWith("/") ? `${window.location.origin}${url}` : url;
  const _url = new URL(fullUrl);
  for (const [k, v] of Object.entries(queries)) {
    if (v !== undefined && v !== null) {
      _url.searchParams.set(k, v.toString());
    }
  }
  return _url.toString();
}

export function formDataToObject(formData: FormData) {
  const data = {};
  for (const [key, value] of formData.entries()) {
    data[key] = value;
  }
  return data;
}

export function formatDate(date: string) {
  const dateObj = new Date(date);
  const dateStr = dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const timeStr = dateObj.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "numeric",
  });
  return `${dateStr} at ${timeStr}`;
}

export function isValidColor(color: string) {
  const c = colord(color);
  return c.isValid();
}

export function isLightColor(color: string, threshold = 0.8) {
  const c = colord(color);
  return c.isValid() && c.brightness() > threshold;
}
