import { useThemeSettings } from "@weaverse/hydrogen";
import { useEffect, useState } from "react";
import type { ThemeSettings } from "~/types/weaverse";

const DISMISS_KEY = "pilot:pwa-hint-dismissed";

/**
 * One-time dismissible "Add to Home Screen" hint for iOS Safari.
 * iOS never shows an install prompt on its own, so without this banner
 * shoppers have no way to discover the installable app. Android relies on
 * Chrome's native install prompt instead — no custom UI there.
 */
export function PwaInstallHint() {
  const { pwaEnabled, pwaIosHint, pwaName } = useThemeSettings<ThemeSettings>();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!pwaEnabled || !pwaIosHint) {
      return;
    }
    if (localStorage.getItem(DISMISS_KEY)) {
      return;
    }
    // Modern iPadOS reports a Macintosh UA; touch points distinguish it.
    const isIos =
      /iPhone|iPad|iPod/.test(navigator.userAgent) ||
      (navigator.userAgent.includes("Macintosh") &&
        navigator.maxTouchPoints > 1);
    const isSafari =
      /Safari/.test(navigator.userAgent) &&
      !/CriOS|FxiOS|EdgiOS/.test(navigator.userAgent);
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // navigator.standalone is a non-standard iOS Safari property
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (isIos && isSafari && !isStandalone) {
      setVisible(true);
    }
  }, [pwaEnabled, pwaIosHint]);

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed inset-x-3 bottom-3 z-50 flex items-center gap-3 rounded-lg bg-neutral-900 p-3 text-sm text-white shadow-lg">
      <p className="grow">
        Install {(pwaName || "").trim() || "our app"}: tap{" "}
        <span aria-label="Share" role="img">
          ⎋
        </span>{" "}
        Share, then <strong>Add to Home Screen</strong>
      </p>
      <button
        type="button"
        aria-label="Dismiss"
        className="shrink-0 p-1 text-lg leading-none"
        onClick={() => {
          localStorage.setItem(DISMISS_KEY, "1");
          setVisible(false);
        }}
      >
        ×
      </button>
    </div>
  );
}
