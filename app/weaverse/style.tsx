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

  if (settings) {
    let {
      colorPrimary,
      colorContrast,
      colorAccent,
      colorPrimaryDark,
      colorContrastDark,
      colorAccentDark,
    } = settings;
    colorPrimary = hexToRgbString(colorPrimary?.toString());
    colorContrast = hexToRgbString(colorContrast?.toString());
    colorAccent = hexToRgbString(colorAccent?.toString());
    colorPrimaryDark = hexToRgbString(colorPrimaryDark?.toString());
    colorContrastDark = hexToRgbString(colorContrastDark?.toString());
    colorAccentDark = hexToRgbString(colorAccentDark?.toString());

    return (
      <style
        id="global-theme-style"
        dangerouslySetInnerHTML={{
          __html: `
            body {
              --color-primary: ${colorPrimary}; /* Text, buttons, etc. */
              --color-contrast: ${colorContrast}; /* Backgrounds, borders, etc. */
              --color-accent: ${colorAccent}; /* Labels like "On sale" */
              --font-size-display: ${settings.fontSizeDisplayMobile}rem; /* text-4xl */
              --font-size-heading: ${settings.fontSizeHeadingMobile}rem; /* text-2xl */
              --font-size-lead: ${settings.fontSizeLead}rem; /* text-lg */
              --font-size-copy: ${settings.fontSizeCopy}rem; /* text-base */
              --font-size-fine: ${settings.fontSizeFine}rem; /* text-xs */
              --height-nav: ${settings.navHeightMobile}rem;
            }
            @media (min-width: 32em) {
              body {
                --height-nav: ${settings.navHeightTablet}rem;
              }
            }
            @media (min-width: 48em) {
              body {
                --height-nav: ${settings.navHeightDesktop}rem;
                --font-size-display: ${settings.fontSizeDisplayDesktop}rem; /* text-6xl */
                --font-size-heading: ${settings.fontSizeHeadingDesktop}rem; /* text-4xl */
              }
            }
            @media (prefers-color-scheme: dark) {
              body {
                --color-primary: ${colorPrimaryDark};
                --color-contrast: ${colorContrastDark};
                --color-accent: ${colorAccentDark};
              }
            }
          `,
        }}
      />
    );
  }
  return null;
}
