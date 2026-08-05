// @ts-nocheck -- Bun's test globals are not part of the Astro app tsconfig.
import { describe, expect, test } from 'bun:test'

const cardSource = await Bun.file(
  new URL('./SpotifyCard.astro', import.meta.url),
).text()
const animationStyles = await Bun.file(
  new URL('../../../styles/animations.css', import.meta.url),
).text()

function cssRule(selector: string): string {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return (
    animationStyles.match(
      new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`),
    )?.[1] ?? ''
  )
}

describe('Spotify card status layout', () => {
  test('reserves equalizer spacing only while Spotify is playing', () => {
    const statusRow = cardSource.match(
      /<span[^>]*data-spotify-status-row[^>]*class="([^"]+)"/,
    )?.[1]

    expect(statusRow).toBeDefined()
    expect(statusRow).not.toMatch(/\bgap-/)
    expect(cssRule('.eq')).toContain('inline-size: 0')
    expect(cssRule('.eq.is-playing')).toContain('inline-size: 18px')
    expect(cssRule('.eq.is-playing')).toContain('margin-inline-end: 6px')
  })
})
