import { useThemeSettings } from "@weaverse/hydrogen";

function hexToPercent(hex: string) {
  let num = parseInt(hex, 16);
  return Math.floor((num / 255) * 100);
}

function hexToRgbString(hexColor: string = ""): string {
  if (!hexColor) return "";
  hexColor = hexColor.replace("#", "");
  if (hexColor.length === 3) {
    hexColor = hexColor.replace(/(.)/g, "$1$1");
  }
  let r = parseInt(hexColor.substring(0, 2), 16) || 0;
  let g = parseInt(hexColor.substring(2, 4), 16) || 0;
  let b = parseInt(hexColor.substring(4, 6), 16) || 0;
  let a = hexToPercent(hexColor.substring(6, 8)) || 0;
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
      headingBaseSize,
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
              /* Colors */
              --color-background: ${colorBackground};
              --color-text: ${colorText};
              --color-sale: ${colorSale};
              --color-border: ${colorBorder};

              /* Typography */
              --body-base-size: ${bodyBaseSize}px;
              --body-base-spacing: ${bodyBaseSpacing};
              --body-base-line-height: ${bodyBaseLineHeight};
              --heading-base-size: ${headingBaseSize}px;
              --heading-base-spacing: ${headingBaseSpacing};
              --heading-base-line-height: ${headingBaseLineHeight};

              --height-nav: ${settings.navHeightMobile}rem;
              --page-width: ${pageWidth}px;
            }

            body, button, input, select, textarea {
              -webkit-font-smoothing: antialiased;
              -webkit-text-size-adjust: 100%;
              font-size: calc(var(--body-base-size) * 0.92);
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
              font-size: calc(var(--heading-base-size) * 0.85);
            }
            h2, .h2 {
              font-size: calc(var(--heading-base-size) * 0.63);
            }
            h3, .h3 {
              font-size: calc(var(--heading-base-size) * 0.57);
            }
            h4, .h4 {
              font-size: calc(var(--heading-base-size) * 0.55);
            }

            /* Desktop sizes */
            @media (min-width: 32em) {
              h1, .h1 {
                font-size: var(--heading-base-size);
              }
              h2, .h2 {
                font-size: calc(var(--heading-base-size) * 0.85);
              }
              h3, .h3 {
                font-size: calc(var(--heading-base-size) * 0.7);
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
            .btn-primary {
              background-color: var(--color-button-bg, ${buttonPrimaryBg});
              color: var(--color-button-text, ${buttonPrimaryColor});
              border-color: var(--color-button-border, ${buttonPrimaryBorder});
            }
            .btn-primary:hover {
              background-color: var(--color-button-bg-hover, ${buttonPrimaryBgHover});
              color: var(--color-button-text-hover, ${buttonPrimaryColorHover});
              border-color: var(--color-button-border-hover, ${buttonPrimaryBorderHover});
            }
            .btn-secondary {
              background-color: var(--color-button-bg, ${buttonSecondaryBg});
              color: var(--color-button-text, ${buttonSecondaryColor});
              border-color: var(--color-button-border, ${buttonSecondaryBorder});
            }
            .btn-secondary:hover {
              background-color: var(--color-button-bg-hover, ${buttonSecondaryBgHover});
              color: var(--color-button-text-hover, ${buttonSecondaryColorHover});
              border-color: var(--color-button-border-hover, ${buttonSecondaryBorderHover});
            }
            .btn-link {
              color: var(--color-button-text, ${buttonLinkColor});
              border-bottom-color: var(--color-button-border, ${buttonLinkColor});
              border-radius: 0;
            }
            .btn-link:hover {
              color: var(--color-button-text-hover, ${buttonLinkColorHover});
              border-bottom-color: var(--color-button-border-hover, ${buttonLinkColorHover});
            }
          `,
        }}
      />
    );
  }
  return null;
}
