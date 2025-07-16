import { isIframe, useWeaverse } from "@weaverse/hydrogen";

export function useWeaverseStudioCheck() {
  const weaverse = useWeaverse();
  const { isDesignMode } = weaverse;

  // If the isDesignMode is undefined, it means the hooks is being used outside of a Weaverse page context.
  // For e.g., in a custom app or in a global component like Header or Footer.
  if (isDesignMode === undefined && isIframe) {
    const search = window.location.search;
    return search.includes("isDesignMode=true");
  }

  return isDesignMode;
}
