import { useThemeSettings } from "@weaverse/hydrogen";
import clsx from "clsx";
import { useCallback, useEffect, useState } from "react";
import { IconX } from "~/components/Icons";
import { Marquee } from "~/components/Marquee";
import { useHeaderStyles } from "~/hooks/useHeaderStyles";

let storageKey = "hide-announcement-bar";

export function AnnouncementBar() {
  let [show, setShow] = useState(false);
  useHeaderStyles(show);
  let themeSettings = useThemeSettings();
  let {
    topbarText,
    topbarHeight,
    topbarTextColor,
    topbarBgColor,
    dismissibleTopbar,
    stickyTopbar,
    enableScrolling,
    scrollingGap,
    scrollingSpeed,
  } = themeSettings;

  let dismiss = useCallback(() => {
    localStorage.setItem(storageKey, "true");
    setShow(false);
  }, []);

  useEffect(() => {
    let hide = localStorage.getItem(storageKey);
    if (hide !== "true") {
      setShow(true);
    }
  }, []);

  if (!show || !topbarText) return null;

  return (
    <div
      id="announcement-bar"
      className={clsx(
        "text-center z-50 flex items-center relative overflow-x-hidden",
        stickyTopbar && "sticky top-0",
      )}
      style={{
        height: `${topbarHeight}px`,
        backgroundColor: topbarBgColor,
        color: topbarTextColor,
      }}
    >
      <Marquee
        key={`${topbarText}${enableScrolling}`}
        speed={scrollingSpeed}
        gap={scrollingGap}
        rollAsNeeded={!enableScrolling}
      >
        <div
          className="flex items-center gap-[var(--gap)] whitespace-nowrap [&_p]:flex [&_p]:gap-2 [&_p]:items-center"
          dangerouslySetInnerHTML={{ __html: topbarText }}
        />
      </Marquee>

      {dismissibleTopbar && (
        <IconX
          className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer w-5 h-5"
          onClick={dismiss}
        />
      )}
    </div>
  );
}
