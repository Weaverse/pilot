/**
 * Emoji-name → Unicode codepoint map, ported from the legacy `css/twemoji.css`
 * (which mapped each name to a Twemoji SVG by codepoint). Instead of fetching
 * remote SVG assets, v4 renders the real Unicode glyph — non-breaking, zero
 * network cost, and visually consistent with native emoji.
 *
 * Codepoint strings keep the legacy `-` separator for multi-codepoint sequences
 * (ZWJ, skin tone, keycaps, variation selectors), e.g. `1f486-200d-2642-fe0f`.
 */
const EMOJI_CODEPOINTS: Record<string, string> = {
  'grinning-squinting-face': '1f606',
  'face-with-steam-from-nose': '1f624',
  'beaming-face-with-smiling-eyes': '1f601',
  'cat-with-tears-of-joy': '1f639',
  'star-struck': '1f929',
  eyes: '1f440',
  'check-mark-button': '2705',
  warning: '26a0',
  'light-bulb': '1f4a1',
  'grinning-face-with-sweat': '1f605',
  'grinning-face-with-big-eyes': '1f603',
  'face-with-tears-of-joy': '1f602',
  'smiling-face-with-sunglasses': '1f60e',
  'waving-hand': '1f44b',
  laptop: '1f4bb',
  'party-popper': '1f389',
  'astonished-face': '1f632',
  'smiling-face-with-tear': '1f972',
  'backhand-index-pointing-down': '1f447',
  'folded-hands': '1f64f',
  'glowing-star': '1f31f',
  'thinking-face': '1f914',
  'thumbs-up': '1f44d',
  'thumbs-down': '1f44e',
  'clapping-hands': '1f44f',
  star: '2b50',
  rocket: '1f680',
  'man-getting-massage': '1f486-200d-2642-fe0f',
  'delivery-truck': '1f69a',
  'man-construction-worker-medium-light-skin-tone':
    '1f477-1f3fc-200d-2642-fe0f',
  'see-no-evil-monkey': '1f648',
  'hear-no-evil-monkey': '1f649',
  'sparkling-heart': '1f496',
  'man-swimming': '1f3ca-200d-2642-fe0f',
  house: '1f3e0',
  'money-with-wings': '1f4b8',
  'magnifying-glass-tilted-right': '1f50e',
  'clinking-beer-mugs': '1f37b',
  'partying-face': '1f973',
  'exploding-head': '1f92f',
  'flexed-biceps': '1f4aa',
  'keycap-1': '31-20e3',
  'keycap-2': '32-20e3',
  'keycap-3': '33-20e3',
  'keycap-4': '34-20e3',
  'keycap-5': '35-20e3',
  'keycap-6': '36-20e3',
  owl: '1f989',
  'face-with-symbols-on-mouth': '1f92c',
  'flag-vietnam': '1f1fb-1f1f3',
  'face-with-monocle': '1f9d0',
  'man-technologist': '1f468-200d-1f4bb',
  'inbox-tray': '1f4e5',
  'man-shrugging': '1f937-200d-2642-fe0f',
  'face-with-rolling-eyes': '1f644',
  'atom-symbol': '269b',
  'bar-chart': '1f4ca',
  'open-book': '1f4d6',
  'page-facing-up': '1f4c4',
  'love-you-gesture': '1f91f',
  bullseye: '1f3af',
  robot: '1f916',
  'artist-palette': '1f3a8',
  'safety-vest': '1f9ba',
  'card-file-box': '1f5c3',
  'party popper': '1f389',
}

function normalizeTwemojiCodepoint(codepoint: string): string {
  // Twemoji's SVG filenames omit U+FE0F for standalone emoji like stopwatch.
  return codepoint === '23f1-fe0f' ? '23f1' : codepoint
}

/**
 * Resolve an emoji name to a local Twemoji SVG filename stem.
 */
export function emojiCodepoint(name: string): string {
  const cp = EMOJI_CODEPOINTS[name]
  return cp ? normalizeTwemojiCodepoint(cp) : ''
}
