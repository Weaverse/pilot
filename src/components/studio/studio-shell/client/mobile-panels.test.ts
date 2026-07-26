// @ts-nocheck -- Bun's test globals are not part of the Astro app tsconfig.
import { describe, expect, test } from 'bun:test'

const tabBarSource = await Bun.file(
  new URL('../TabBar.astro', import.meta.url),
).text()
const sidebarSource = await Bun.file(
  new URL('../Sidebar.astro', import.meta.url),
).text()
const shellSource = await Bun.file(
  new URL('../../StudioShell.astro', import.meta.url),
).text()

describe('mobile studio navigation', () => {
  test('exposes the existing explorer as a mobile panel', () => {
    expect(tabBarSource).toContain('data-toggle-mobile-panel="sidebar"')
    expect(tabBarSource).toContain('aria-controls="studio-sidebar"')
    expect(sidebarSource).toContain('id="studio-sidebar"')
    expect(sidebarSource).toContain('studio-mobile-panel--left')
    expect(shellSource).toContain('data-mobile-panel-backdrop')
  })
})
