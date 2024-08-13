import { useThemeSettings } from "@weaverse/hydrogen";

function hexToPercent(hex: string) {
  let num = Number.parseInt(hex, 16);
  return Math.floor((num / 255) * 100);
}

function hexToRgbString(hexColor = ""): string {
  if (!hexColor) return "";
  let hex = hexColor.replace("#", "");
  if (hex.length === 3) {
    hex = hex.replace(/(.)/g, "$1$1");
  }
  let r = Number.parseInt(hex.substring(0, 2), 16) || 0;
  let g = Number.parseInt(hex.substring(2, 4), 16) || 0;
  let b = Number.parseInt(hex.substring(4, 6), 16) || 0;
  let a = hexToPercent(hex.substring(6, 8)) || 0;
  let val = `${r} ${g} ${b}`;
  return `${val}${a ? ` / ${a}%` : ""}`.trim();
}

export function GlobalStyle() {
  let settings = useThemeSettings();
  if (settings) {
    let {
      colorText,
      colorBackground,
      colorForeground,
      colorLine,
      topbarTextColor,
      topbarBgColor,
      headerBgColor,
      headerText,
      transparentHeaderText,
      footerBgColor,
      footerText,
      buttonPrimaryBg,
      buttonPrimaryColor,
      buttonSecondaryBg,
      buttonSecondaryColor,
      buttonOutlineTextAndBorder,
      drawersBg,
      comparePriceTextColor,
      saleTagColor,
      newTagColor,
      otherTagColor,
      soldOutAndUnavailable,
      starRating,
      bodyBaseSize,
      bodyBaseSpacing,
      bodyBaseLineHeight,
      h1BaseSize,
      headingBaseSpacing,
      headingBaseLineHeight,
      navHeightDesktop,
      navHeightTablet,
      pageWidth,
    } = settings;

    return (
      <style
        id="global-theme-style"
        key="global-theme-style"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: `
            :root {
              /* Layout */
              --height-nav: ${settings.navHeightMobile}rem;
              --page-width: ${pageWidth}px;

              /* Colors */
              --color-text: ${hexToRgbString(colorText)};
              --color-background: ${hexToRgbString(colorBackground)};
              --color-foreground: ${hexToRgbString(colorForeground)};
              --color-line: ${hexToRgbString(colorLine)};
              --color-topbar-text: ${topbarTextColor};
              --color-topbar-bg: ${topbarBgColor};
              --color-header-bg: ${headerBgColor};
              --color-header-text: ${headerText};
              --color-transparent-header-text: ${transparentHeaderText};
              --color-footer-bg: ${footerBgColor};
              --color-footer-text: ${footerText};
              --color-button-primary-bg: ${buttonPrimaryBg};
              --color-button-primary-text: ${buttonPrimaryColor};
              --color-button-secondary-bg: ${buttonSecondaryBg};
              --color-button-secondary-text: ${buttonSecondaryColor};
              --color-button-outline-text-and-border: ${buttonOutlineTextAndBorder};
              --color-drawers-bg: ${drawersBg};
              --color-compare-price-text: ${comparePriceTextColor};
              --color-sale-tag: ${saleTagColor};
              --color-new-tag: ${newTagColor};
              --color-other-tag: ${otherTagColor};
              --color-sold-out-and-unavailable: ${soldOutAndUnavailable};
              --color-star-rating: ${starRating};

              /* Typography */
              --body-base-size: ${bodyBaseSize}px;
              --body-base-spacing: ${bodyBaseSpacing};
              --body-base-line-height: ${bodyBaseLineHeight};

              --heading-scale-ratio: 1.2;
              --heading-mobile-scale-ratio: 1.1;

              --h1-base-size: ${h1BaseSize}px;
              --h2-base-size: round(calc(var(--h1-base-size) / var(--heading-scale-ratio)), 1px);
              --h3-base-size: round(calc(var(--h2-base-size) / var(--heading-scale-ratio)), 1px);
              --h4-base-size: round(calc(var(--h3-base-size) / var(--heading-scale-ratio)), 1px);
              --h5-base-size: round(calc(var(--h4-base-size) / var(--heading-scale-ratio)), 1px);
              --h6-base-size: round(calc(var(--h5-base-size) / var(--heading-scale-ratio)), 1px);

              --h1-mobile-size: round(calc(var(--h1-base-size) / var(--heading-mobile-scale-ratio)), 1px);
              --h2-mobile-size: round(calc(var(--h2-base-size) / var(--heading-mobile-scale-ratio)), 1px);
              --h3-mobile-size: round(calc(var(--h3-base-size) / var(--heading-mobile-scale-ratio)), 1px);
              --h4-mobile-size: round(calc(var(--h4-base-size) / var(--heading-mobile-scale-ratio)), 1px);
              --h5-mobile-size: round(calc(var(--h5-base-size) / var(--heading-mobile-scale-ratio)), 1px);
              --h6-mobile-size: round(calc(var(--h6-base-size) / var(--heading-mobile-scale-ratio)), 1px);

              --heading-base-spacing: ${headingBaseSpacing};
              --heading-base-line-height: ${headingBaseLineHeight};

            body, button, input, select, textarea {
              -webkit-font-smoothing: antialiased;
              -webkit-text-size-adjust: 100%;
              font-size: var(--body-base-size);
              letter-spacing: var(--body-base-spacing);
              line-height: var(--body-base-line-height);
              text-rendering: optimizeSpeed;
            }

            .h0, .h1, .h2, .h3, .h4, .h5, .h6, h1, h2, h3, h4, h5, h6 {
              letter-spacing: var(--heading-base-spacing);
              line-height: var(--heading-base-line-height);
            }

            /* Mobile sizes */
            h1, .h1 {
              font-size: var(--h1-mobile-size);
            }
            h2, .h2 {
              font-size: var(--h2-mobile-size);
            }
            h3, .h3 {
              font-size: var(--h3-mobile-size);
            }
            h4, .h4 {
              font-size: var(--h4-mobile-size);
            }
            h5, .h5 {
              font-size: var(--h5-mobile-size);
            }
            h6, .h6 {
              font-size: var(--h6-mobile-size);
            }

            /* Desktop sizes */
            @media (min-width: 32em) {
              h1, .h1 {
                font-size: var(--h1-base-size);
              }
              h2, .h2 {
                font-size: var(--h2-base-size);
              }
              h3, .h3 {
                font-size: var(--h3-base-size);
              }
              h4, .h4 {
                font-size: var(--h4-base-size);
              }
              h5, .h5 {
                font-size: var(--h5-base-size);
              }
              h6, .h6 {
                font-size: var(--h6-base-size);
              }
            }

            @media (min-width: 32em) {
              body {
                --height-nav: ${navHeightTablet}rem;
              }
            }
            @media (min-width: 48em) {
              body {
                --height-nav: ${navHeightDesktop}rem;
              }
            }
          `,
        }}
      />
    );
  }
  return null;
}
