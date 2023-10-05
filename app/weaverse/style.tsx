import {useThemeSettings} from '@weaverse/hydrogen';

function hexToRgbString(hexColor: string = ''): string {
  hexColor = hexColor.replace('#', '');
  let r = parseInt(hexColor.substring(0, 2), 16) || '';
  let g = parseInt(hexColor.substring(2, 4), 16) || '';
  let b = parseInt(hexColor.substring(4, 6), 16) || '';
  return `${r} ${g} ${b}`.trim();
}

export function GlobalStyle() {
  let settings = useThemeSettings();
  let defaultSettings = {
    colorBackground: '#ffffff',
    colorBackgroundSubtle: '#0f0f0f08',
    colorText: '#0f0f0f',
    colorTextSubtle: '#666666',
    colorButton: '#0f0f0f',
    colorButtonText: '#ffffff',
    colorInverseButton: '#ffffff',
    colorInverseButtonText: '#0f0f0f',
    colorSale: '#de4b4b',
    colorBorder: '#0f0f0f',
    bodyBaseSize: 18,
    bodyBaseSpacing: 0,
    bodyBaseLineheight: 1.5,
    headingBaseSize: 38,
  };

  if (settings) {
    settings = {...defaultSettings, ...settings};
    let {
      colorBackground,
      colorBackgroundSubtle,
      colorText,
      colorTextSubtle,
      colorButton,
      colorButtonText,
      colorInverseButton,
      colorInverseButtonText,
      colorSale,
      colorBorder,
      bodyBaseSize,
      bodyBaseSpacing,
      bodyBaseLineheight,
      headingBaseSize,
      navHeightDesktop,
      navHeightTablet
    } = settings;
    colorBackground = hexToRgbString(colorBackground?.toString());
    colorBackgroundSubtle = hexToRgbString(colorBackgroundSubtle?.toString());
    colorText = hexToRgbString(colorText?.toString());
    colorTextSubtle = hexToRgbString(colorTextSubtle?.toString());
    colorButton = hexToRgbString(colorButton?.toString());
    colorButtonText = hexToRgbString(colorButtonText?.toString());
    colorInverseButton = hexToRgbString(colorInverseButton?.toString());
    colorInverseButtonText = hexToRgbString(colorInverseButtonText?.toString());
    colorSale = hexToRgbString(colorSale?.toString());
    colorBorder = hexToRgbString(colorBorder?.toString());

    return (
      <style
        id="global-theme-style"
        dangerouslySetInnerHTML={{
          __html: `
            :root {
              --color-background: ${colorBackground};
              --color-background-subtle: ${colorBackgroundSubtle};
              --color-text: ${colorText};
              --color-text-subtle: ${colorTextSubtle};
              --color-button: ${colorButton};
              --color-button-text: ${colorButtonText};
              --color-inverse-button: ${colorInverseButton};
              --color-inverse-button-text: ${colorInverseButtonText};
              --color-sale: ${colorSale};
              --color-border: ${colorBorder};

              --body-base-size: ${bodyBaseSize}px;
              --body-base-spacing: ${bodyBaseSpacing}px;
              --body-base-lineheight: ${bodyBaseLineheight};
              --heading-base-size: ${headingBaseSize}px;
              --height-nav: ${settings.navHeightMobile}rem;
            }
            body, button, input, select, textarea {
              -webkit-font-smoothing: antialiased;
              -webkit-text-size-adjust: 100%;
              font-size: calc(var(--body-base-size)*0.92);
              letter-spacing: var(--body-base-spacing);
              line-height: var(--body-base-lineheight);
              text-rendering: optimizeSpeed;
            }

            /* Mobile sizes */
            h1, .h1 {
              font-size: calc(var(--heading-base-size) * 0.85);
            }

            h2, .h2 {
              font-size: calc(var(--heading-base-size) * 0.73);
            }

            h3, .h3 {
              font-size: calc(var(--heading-base-size) * 0.62);
            }

            /* Desktop sizes */
            @media (min-width: 768px) {
              h1, .h1 {
                font-size: var(--heading-base-size);
              }

              h2, .h2 {
                font-size: calc(var(--heading-base-size) * 0.85);
              }

              h3, .h3 {
                font-size: calc(var(--heading-base-size) * 0.65);
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
