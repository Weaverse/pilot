import { useThemeSettings } from "@weaverse/hydrogen";
import { useEffect } from "react";

const MAX_DURATION = 20;

export function ScrollingAnnouncement() {
  let themeSettings = useThemeSettings();
  let {
    topbarText,
    topbarHeight,
    topbarTextColor,
    topbarBgColor,
    topbarScrollingGap,
    topbarScrollingSpeed,
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
      className="text-center relative flex items-center whitespace-nowrap overflow-hidden"
      style={
        {
          height: `${topbarHeight}px`,
          backgroundColor: topbarBgColor,
          color: topbarTextColor,
          "--marquee-duration": `${MAX_DURATION / topbarScrollingSpeed}s`,
          "--gap": `${topbarScrollingGap}px`,
        } as React.CSSProperties
      }
    >
      {new Array(10).fill("").map((_, idx) => {
        return (
          <div className="animate-marquee px-[calc(var(--gap)/2)]" key={idx}>
            <div
              className="flex items-center gap-[--gap] whitespace-nowrap [&_p]:flex [&_p]:gap-2 [&_p]:items-center"
              dangerouslySetInnerHTML={{ __html: topbarText }}
            />
          </div>
        );
      })}
    </div>
  );
}
