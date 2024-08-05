import { useThemeSettings } from "@weaverse/hydrogen";
import clsx from "clsx";
import { useCallback, useEffect, useState } from "react";
import { Marquee } from "~/components/Marquee";
import { IconClose } from "../Icon";

const storageKey = "hide-announcement-bar";

function standardizeContent(content: string) {
  // remove br, p, div and \n
  return content
    .replace(/<br\/?>/g, "")
    .replace(/<p>/g, "")
    .replace(/<\/p>/g, "")
    .replace(/<div>/g, "")
    .replace(/<\/div>/g, "")
    .replace(/\n/g, "");
}

export function AnnouncementBar() {
  let [show, setShow] = useState(false);
  let [contentWidth, setContentWidth] = useState(0);
  const themeSettings = useThemeSettings();
  const {
    announcementBarText,
    announcementBarHeight,
    announcementBarFontSize,
    announcementBarTextColor,
    announcementBarBgColor,
    dismisableAnnouncementBar,
    stickyAnnouncementBar,
    enableScrolling,
    scrollingGap,
    scrollingSpeed,
  } = themeSettings;
  const standardContent = standardizeContent(announcementBarText);
  const settings = {
    content: standardContent,
    announcementBarTextColor,
    announcementBarFontSize,
    announcementBarBgColor,
    announcementBarHeight,
    dismisable: dismisableAnnouncementBar,
    sticky: stickyAnnouncementBar,
    enableScrolling,
    scrollingGap: scrollingGap,
    scrollingSpeed,
    contentWidth,
  };
  const { content, sticky, dismisable } = settings;
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

  if (!show || !content) return null;

  const maxAnimationTime = 100000; // 100 seconds - slowest speed 0% - 0 speed
  const minAnimationTime = 1000; // 1 second - fastest speed 100% - 100 speed
  const animationTime =
    ((100 - scrollingSpeed) * (maxAnimationTime - minAnimationTime)) / 100 +
    minAnimationTime;
  return (
    <div
      id="announcement-bar"
      className={clsx(
        "text-center z-40 flex items-center justify-center relative overflow-x-hidden",
        sticky && "sticky top-0",
      )}
      style={{
        height: `${announcementBarHeight}px`,
        backgroundColor: announcementBarBgColor,
        color: announcementBarTextColor,
        fontSize: `${announcementBarFontSize}px`,
        ["--animation-speed" as string]: `${animationTime}ms`,
      }}
    >
      {enableScrolling ? (
        <Marquee speed={10} gap={scrollingGap}>
          <span dangerouslySetInnerHTML={{ __html: content }} />
        </Marquee>
      ) : (
        <span dangerouslySetInnerHTML={{ __html: content }} />
      )}
      {dismisable && (
        <IconClose
          className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
          onClick={dismiss}
        />
      )}
    </div>
  );
}
