import { createElement, useEffect, useState } from "react";

/**
 * Same build classic hydrogen-react loaded. The CSP (`app/weaverse/csp.ts`)
 * allows unpkg.com for it.
 */
const MODEL_VIEWER_SCRIPT =
  "https://unpkg.com/@google/model-viewer@v1.12.1/dist/model-viewer.min.js";

let modelViewerScript: Promise<void> | undefined;

function loadModelViewerScript() {
  modelViewerScript ??= new Promise<void>((resolve, reject) => {
    let script = document.createElement("script");
    script.type = "module";
    script.src = MODEL_VIEWER_SCRIPT;
    script.onload = () => resolve();
    script.onerror = () => reject();
    document.body.appendChild(script);
  });
  return modelViewerScript;
}

type ModelViewerProps = {
  /** A Storefront API `Model3d` (`sources[0].url` is the model). */
  data: {
    id?: string | null;
    alt?: string | null;
    sources?: { url?: string | null }[] | null;
    previewImage?: { url?: string | null } | null;
  };
  /** USDZ source for iOS Quick Look AR. */
  iosSrc?: string;
  loading?: "auto" | "lazy" | "eager";
  // "interaction" is a valid runtime value in model-viewer v1.12.1.
  reveal?: "auto" | "manual" | "interaction";
  className?: string;
};

/**
 * Local port of classic hydrogen-react's `<ModelViewer>` (removed in Hydrogen
 * 2026.10). Lazily injects the `@google/model-viewer` module script, then
 * renders `<model-viewer>` with the same attributes and defaults classic set
 * (camera controls, autoplay, poster, interpolation decay, no shadows). Only
 * the props Pilot passes are kept; classic's event-handler and tuning props
 * were never used.
 */
export function ModelViewer({
  data,
  iosSrc,
  loading,
  reveal,
  className,
}: ModelViewerProps) {
  let [status, setStatus] = useState<"loading" | "done" | "error">("loading");

  useEffect(() => {
    loadModelViewerScript()
      .then(() => setStatus("done"))
      .catch(() => setStatus("error"));
  }, []);

  if (status !== "done") {
    return null;
  }
  let src = data.sources?.[0]?.url;
  if (!src) {
    throw new Error(
      "<ModelViewer/> requires 'data.sources' prop to be an array, with an object that has a property 'url' on it. Rendering 'null'",
    );
  }
  if (!data.alt) {
    console.warn(
      "<ModelViewer/> requires the 'data.alt' prop for accessibility",
    );
  }
  return createElement("model-viewer", {
    class: className,
    id: data.id,
    src,
    alt: data.alt ?? null,
    "camera-controls": true,
    poster: data.previewImage?.url ?? null,
    autoplay: true,
    loading,
    reveal,
    "ios-src": iosSrc,
    "interpolation-decay": 100,
    "shadow-intensity": 0,
    "shadow-softness": 0,
  });
}
