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
      colorBackground,
      colorText,
      // colorInverseBackground,
      // colorInverseText,
      // colorButton,
      // colorButtonText,
      // colorInverseButton,
      // colorInverseButtonText,
      colorSale,
      colorBorder,
      bodyBaseSize,
      bodyBaseSpacing,
      bodyBaseLineHeight,
      h1BaseSize,
      headingBaseSpacing,
      headingBaseLineHeight,
      navHeightDesktop,
      navHeightTablet,
      buttonPrimaryBg,
      buttonPrimaryBgHover,
      buttonPrimaryColor,
      buttonPrimaryColorHover,
      buttonPrimaryBorder,
      buttonPrimaryBorderHover,
      buttonSecondaryBg,
      buttonSecondaryBgHover,
      buttonSecondaryColor,
      buttonSecondaryColorHover,
      buttonSecondaryBorder,
      buttonSecondaryBorderHover,
      buttonOutlineBg,
      buttonOutlineBgHover,
      buttonOutlineColor,
      buttonOutlineColorHover,
      buttonOutlineBorder,
      buttonOutlineBorderHover,
      buttonLinkColor,
      buttonLinkColorHover,
      pageWidth,
    } = settings;

    colorBackground = hexToRgbString(colorBackground);
    // colorInverseBackground = hexToRgbString(colorInverseBackground);
    colorText = hexToRgbString(colorText);
    // colorInverseText = hexToRgbString(colorInverseText);
    // colorButton = hexToRgbString(colorButton);
    // colorButtonText = hexToRgbString(colorButtonText);
    // colorInverseButton = hexToRgbString(colorInverseButton);
    // colorInverseButtonText = hexToRgbString(colorInverseButtonText);
    colorSale = hexToRgbString(colorSale);
    colorBorder = hexToRgbString(colorBorder);

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
              --color-background: ${colorBackground};
              --color-text: ${colorText};
              --color-sale: ${colorSale};
              --color-border: ${colorBorder};

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

							/* Buttons */
							--button-primary-bg: ${buttonPrimaryBg};
							--button-primary-color: ${buttonPrimaryColor};
							--button-primary-border: ${buttonPrimaryBorder};
							--button-primary-bg-hover: ${buttonPrimaryBgHover};
							--button-primary-color-hover: ${buttonPrimaryColorHover};
							--button-primary-border-hover: ${buttonPrimaryBorderHover};
							--button-secondary-bg: ${buttonSecondaryBg};
							--button-secondary-color: ${buttonSecondaryColor};
							--button-secondary-border: ${buttonSecondaryBorder};
							--button-secondary-bg-hover: ${buttonSecondaryBgHover};
							--button-secondary-color-hover: ${buttonSecondaryColorHover};
							--button-secondary-border-hover: ${buttonSecondaryBorderHover};
							--button-outline-bg: ${buttonOutlineBg};
							--button-outline-color: ${buttonOutlineColor};
							--button-outline-border: ${buttonOutlineBorder};
							--button-outline-bg-hover: ${buttonOutlineBgHover};
							--button-outline-color-hover: ${buttonOutlineColorHover};
							--button-outline-border-hover: ${buttonOutlineBorderHover};
							--button-link-color: ${buttonLinkColor};
							--button-link-color-hover: ${buttonLinkColorHover};
            }

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
