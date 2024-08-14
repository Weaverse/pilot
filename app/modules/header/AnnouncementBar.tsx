import { useThemeSettings } from "@weaverse/hydrogen";
import clsx from "clsx";
import { useCallback, useEffect, useState } from "react";
import { IconX } from "~/components/Icons";
import { Marquee } from "~/components/Marquee";

let storageKey = "hide-announcement-bar";

function standardizeContent(content: string) {
  // remove br, p, div and \n
  return content
    ? content
        .replace(/<br\/?>/g, "")
        .replace(/<p>/g, "")
        .replace(/<\/p>/g, "")
        .replace(/<div>/g, "")
        .replace(/<\/div>/g, "")
        .replace(/\n/g, "")
    : "";
}

export function AnnouncementBar() {
  let [show, setShow] = useState(false);
  let [contentWidth, setContentWidth] = useState(0);
  let themeSettings = useThemeSettings();
  let {
    announcementBarText,
    announcementBarHeight,
    topbarTextColor,
    topbarBgColor,
    dismissibleAnnouncementBar,
    stickyAnnouncementBar,
    enableScrolling,
    scrollingGap,
    scrollingSpeed,
  } = themeSettings;
  let dismiss = useCallback(() => {
    localStorage.setItem(storageKey, "true");
    setShow(false);
  }, []);

  useEffect(() => {
    if (!enableScrolling) {
      setContentWidth(0);
    }
  }, [enableScrolling]);
  useEffect(() => {
    let hide = localStorage.getItem(storageKey);
    if (hide !== "true") {
      setShow(true);
    }
  }, []);

  if (!show || !announcementBarText) return null;

  let maxAnimationTime = 100000; // 100 seconds - slowest speed 0% - 0 speed
  let minAnimationTime = 1000; // 1 second - fastest speed 100% - 100 speed
  let animationTime =
    ((100 - scrollingSpeed) * (maxAnimationTime - minAnimationTime)) / 100 +
    minAnimationTime;

  return (
    <div
      id="announcement-bar"
      className={clsx(
        "text-center z-40 flex items-center justify-center relative overflow-x-hidden",
        stickyAnnouncementBar && "sticky top-0",
      )}
      style={{
        height: `${announcementBarHeight}px`,
        backgroundColor: topbarBgColor,
        color: topbarTextColor,
        ["--animation-speed" as string]: `${animationTime}ms`,
      }}
    >
      {enableScrolling ? (
        <Marquee speed={10} gap={scrollingGap}>
          <div
            className="flex items-center justify-center gap-[var(--gap)]"
            dangerouslySetInnerHTML={{ __html: announcementBarText }}
          />
        </Marquee>
      ) : (
        <div
          className="flex items-center justify-center gap-[var(--gap)]"
          dangerouslySetInnerHTML={{ __html: announcementBarText }}
        />
      )}
      {dismissibleAnnouncementBar && (
        <IconX
          className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer w-5 h-5"
          onClick={dismiss}
        />
      )}
    </div>
  );
}
