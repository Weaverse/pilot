import clsx from "clsx";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { IconClose } from "../Icon";
import { useThemeSettings } from "@weaverse/hydrogen";

const storageKey = "hide-announcement-bar";

function standardizeContent(content: string) {
    // remove br, p, div and \n 
  return content.replace(/<br\/?>/g, "").replace(/<p>/g, "").replace(/<\/p>/g, "").replace(/<div>/g, "").replace(/<\/div>/g, "").replace(/\n/g, "");
}

const announcementContext = createContext({
  content: "",
  announcementBarTextColor: "",
  announcementBarBgColor: "",
  announcementBarHeight: 0,
  sticky: false,
  dismisable: false,
  enableScrolling: false,
  scrollingGap: 0,
  scrollingSpeed: 0,
  contentWidth: 0,
});

function useAnnouncement() {
  const context = useContext(announcementContext);
  if (context === undefined) {
    throw new Error("useAnnouncement must be used within AnnouncementBar");
  }
  return context;
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
  let contentRef = useRef<HTMLSpanElement>(null);
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

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (show && enableScrolling) {
      if (contentRef.current) {
        let width = contentRef.current.getBoundingClientRect().width;
        setContentWidth(width);
      }
    }
  }, [contentRef, show, enableScrolling]);
  if (!show) return null;

  if (!content) return null;
  const maxAnimationTime = 100000; // 100 seconds - slowest speed 0% - 0 speed
  const minAnimationTime = 1000; // 1 second - fastest speed 100% - 100 speed
  const animationTime =
    ((100 - scrollingSpeed) * (maxAnimationTime - minAnimationTime)) / 100 +
    minAnimationTime;
  return (
    <announcementContext.Provider value={settings}>
      <div
      id="announcement-bar"
        className={clsx(
          "text-center z-40 flex items-center justify-center relative overflow-x-hidden",
          sticky && "sticky top-0"
        )}
        style={{
          height: `${announcementBarHeight}px`,
          backgroundColor: announcementBarBgColor,
          color: announcementBarTextColor,
          fontSize: `${announcementBarFontSize}px`,
          ["--animation-speed" as string]: `${animationTime}ms`,
        }}
      >
        <div
          className={clsx(
            enableScrolling && "opacity-0",
            contentWidth > 0 && "hidden"
          )}
        >
          <span
            ref={contentRef}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
        {contentWidth > 0 && <RunningLine />}
        {dismisable && <IconClose
          className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
          onClick={dismiss}
        />}
      </div>
    </announcementContext.Provider>
  );
}

function RunningLine() {
  return (
    <div className="flex items-center">
      <div className="shrink-0 animate-marquee">
        <OneView />
      </div>
      <div className="shrink-0 animate-marquee">
        <OneView />
      </div>
    </div>
  );
}

function OneView() {
  const { content, contentWidth, scrollingGap } = useAnnouncement();
  const [contentRepeat, setContentRepeat] = useState(0);
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    // check if the text is longer than the screen width
    if (contentWidth < window.innerWidth) {
      // if it is, set the contentRepeat to the number of times the text can fit on the screen
      const repeat = Math.ceil(
        window.innerWidth / (contentWidth + scrollingGap)
      );
      setContentRepeat(repeat);
    }
  }, []);
  return (
    <div
      className={clsx("flex")}
      style={{ paddingRight: scrollingGap, gap: scrollingGap }}
    >
      {Array(contentRepeat + 1)
        .fill(0)
        .map((_, index) => (
          <div
            key={index}
            className="shrink-0"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        ))}
    </div>
  );
}
