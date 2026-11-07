import type { ComponentPropsWithRef } from "react";

type ExternalVideoProps = Omit<ComponentPropsWithRef<"iframe">, "src"> & {
  /** A Storefront API `ExternalVideo` (`embedUrl`, plus `id`/`alt`). */
  data: { id?: string | null; alt?: string | null; embedUrl?: string | null };
  /** Extra embed URL params (e.g. YouTube `autoplay`). */
  options?: Record<string, string | number | boolean | undefined>;
};

/**
 * Local port of classic hydrogen-react's `<ExternalVideo>` (removed in
 * Hydrogen 2026.10): renders the YouTube/Vimeo embed iframe with the same
 * attributes and defaults.
 */
export function ExternalVideo({
  data,
  options,
  id = data.id ?? undefined,
  frameBorder = "0",
  allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture",
  allowFullScreen = true,
  loading = "lazy",
  ...passthroughProps
}: ExternalVideoProps) {
  if (!data.embedUrl) {
    throw new Error("<ExternalVideo/> requires the 'embedUrl' property");
  }
  let finalUrl = data.embedUrl;
  if (options) {
    let urlObject = new URL(data.embedUrl);
    for (let [key, value] of Object.entries(options)) {
      if (typeof value === "undefined") {
        continue;
      }
      urlObject.searchParams.set(key, value.toString());
    }
    finalUrl = urlObject.toString();
  }
  return (
    <iframe
      {...passthroughProps}
      id={id ?? data.embedUrl}
      title={data.alt ?? data.id ?? "external video"}
      frameBorder={frameBorder}
      allow={allow}
      allowFullScreen={allowFullScreen}
      src={finalUrl}
      loading={loading}
    />
  );
}
