import { useThemeSettings } from "@weaverse/hydrogen";
import clsx from "clsx";
import { useCallback, useEffect, useState } from "react";
import { IconX } from "~/components/Icons";
import { Marquee } from "~/components/Marquee";
import { useHeaderStyles } from "~/hooks/useHeaderStyles";

const storageKey = "hide-announcement-bar";

export function AnnouncementBar() {
  let [show, setShow] = useState(false);
  useHeaderStyles(show);
  let [contentWidth, setContentWidth] = useState(0);
  const themeSettings = useThemeSettings();
  const {
    announcementBarText,
    announcementBarHeight,
    announcementBarTextColor,
    announcementBarBgColor,
    dismissibleAnnouncementBar,
    stickyAnnouncementBar,
    enableScrolling,
    alwaysScrolling,
    scrollingGap,
    scrollingSpeed,
  } = themeSettings;
  const standardContent = announcementBarText;
  const settings = {
    content: standardContent,
    announcementBarTextColor,
    announcementBarBgColor,
    announcementBarHeight,
    dismissible: dismissibleAnnouncementBar,
    sticky: stickyAnnouncementBar,
    enableScrolling,
    alwaysScrolling,
    scrollingGap: scrollingGap,
    scrollingSpeed,
    contentWidth,
  };
  const { content, sticky, dismissible } = settings;
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

  return (
    <div
      id="announcement-bar"
      className={clsx(
        "text-center z-50 flex items-center relative overflow-x-hidden",
        sticky && "sticky top-0"
      )}
      style={{
        height: `${announcementBarHeight}px`,
        backgroundColor: announcementBarBgColor,
        color: announcementBarTextColor,
      }}
    >
      
        <Marquee key={`${content}${alwaysScrolling}`} speed={scrollingSpeed} gap={scrollingGap} rollAsNeeded={!alwaysScrolling}>
          <div
            className="flex items-center gap-[var(--gap)] whitespace-nowrap"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </Marquee>
     
      {dismissible && (
        <IconX
          className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer w-5 h-5"
          onClick={dismiss}
        />
      )}
    </div>
  );
}
