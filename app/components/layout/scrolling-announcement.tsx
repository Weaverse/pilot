import { useThemeSettings } from "@weaverse/hydrogen";
import { useEffect } from "react";
import { useLegacyThemeText } from "~/hooks/use-legacy-theme-text";
import type { ThemeSettings } from "~/types/weaverse";

const MAX_DURATION = 20;

/**
 * Whether announcement copy renders anything a shopper can see.
 *
 * The copy is rich text, so `"<p></p>"` is a non-empty string that paints
 * nothing. `RootLayout` reserves `--initial-topbar-height` from this same
 * answer: deciding it by truthiness there and by visible text here reserved
 * space for a bar that never rendered, and the header jumped on hydration.
 */
export function hasVisibleAnnouncement(
  html: string | null | undefined,
): boolean {
  return (
    Boolean(html) && (html as string).replace(/<[^>]*>/g, "").trim() !== ""
  );
}

export function ScrollingAnnouncement() {
  const themeSettings = useThemeSettings<ThemeSettings>();
  const themeText = useLegacyThemeText();
  const {
    topbarHeight,
    topbarTextColor,
    topbarBgColor,
    topbarScrollingGap,
    topbarScrollingSpeed,
  } = themeSettings;
  const topbarText = themeText("announcement.topbarText");

  function updateStyles() {
    if (hasVisibleAnnouncement(topbarText)) {
      document.body.style.setProperty(
        "--topbar-height",
        `${Math.max(topbarHeight - window.scrollY, 0)}px`,
      );
    } else {
      document.body.style.setProperty("--topbar-height", "0px");
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation> --- IGNORE ---
  useEffect(() => {
    updateStyles();
    window.addEventListener("scroll", updateStyles);
    return () => window.removeEventListener("scroll", updateStyles);
  }, [topbarText]);

  if (!hasVisibleAnnouncement(topbarText)) {
    return null;
  }

  return (
    <div
      id="announcement-bar"
      className="relative flex items-center overflow-hidden whitespace-nowrap text-center"
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
          <div
            className="animate-marquee px-[calc(var(--gap)/2)] [animation-duration:var(--marquee-duration)]"
            key={idx}
          >
            <div
              className="flex items-center gap-(--gap) whitespace-nowrap [&_p]:flex [&_p]:items-center [&_p]:gap-2"
              dangerouslySetInnerHTML={{ __html: topbarText }}
            />
          </div>
        );
      })}
    </div>
  );
}
