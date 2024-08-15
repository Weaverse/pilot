import { useThemeSettings } from "@weaverse/hydrogen";
import { useCallback, useEffect } from "react";

export function useHeaderStyles(show: boolean) {
  let { stickyTopbar, topbarHeight } = useThemeSettings();
  const updateStyles = useCallback(() => {
    let y = window.scrollY;
    let top = stickyTopbar ? topbarHeight : Math.max(topbarHeight - y, 0);
    document.body.style.setProperty("--announcement-bar-height", `${top}px`);
  }, [stickyTopbar, topbarHeight]);

  useEffect(() => {
    if (!show) {
      if (document.body.style.getPropertyValue("--announcement-bar-height")) {
        document.body.style.removeProperty("--announcement-bar-height");
      }
      return;
    }
    updateStyles();
    window.addEventListener("scroll", updateStyles);
    return () => window.removeEventListener("scroll", updateStyles);
  }, [updateStyles, show]);
}
