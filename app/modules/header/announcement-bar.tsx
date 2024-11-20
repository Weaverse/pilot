import { useThemeSettings } from "@weaverse/hydrogen";
import { useEffect } from "react";
import { Marquee } from "./marquee";

export function AnnouncementBar() {
  let themeSettings = useThemeSettings();
  let {
    topbarText,
    topbarHeight,
    topbarTextColor,
    topbarBgColor,
    enableScrolling,
    scrollingGap,
    scrollingSpeed,
  } = themeSettings;

  function updateStyles() {
    if (topbarText) {
      document.body.style.setProperty(
        "--topbar-height",
        `${Math.max(topbarHeight - window.scrollY, 0)}px`,
      );
    } else {
      document.body.style.setProperty("--topbar-height", "0px");
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    updateStyles();
    window.addEventListener("scroll", updateStyles);
    return () => window.removeEventListener("scroll", updateStyles);
  }, [topbarText]);

  if (!topbarText) {
    return null;
  }

  return (
    <div
      id="announcement-bar"
      className="text-center z-50 flex items-center relative overflow-x-hidden"
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
          className="flex items-center gap-[--gap] whitespace-nowrap [&_p]:flex [&_p]:gap-2 [&_p]:items-center"
          dangerouslySetInnerHTML={{
            __html: new Array(10).fill(topbarText).join(""),
          }}
        />
      </Marquee>
    </div>
  );
}
