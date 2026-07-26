// @ts-nocheck -- Bun's test globals are not part of the Astro app tsconfig.
import { describe, expect, test } from 'bun:test'
import { nextMobilePanel } from './mobile-panels'

const tabBarSource = await Bun.file(
  new URL('../TabBar.astro', import.meta.url),
).text()
const sidebarSource = await Bun.file(
  new URL('../Sidebar.astro', import.meta.url),
).text()
const runtimeRailSource = await Bun.file(
  new URL('../../runtime-rail/RuntimeRail.astro', import.meta.url),
).text()
const mobilePanelSource = await Bun.file(
  new URL('./mobile-panels.ts', import.meta.url),
).text()
const studioStyles = await Bun.file(
  new URL('../../../../styles/studio.css', import.meta.url),
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

  test('exposes the persisted runtime rail as a mobile panel', () => {
    expect(tabBarSource).toContain('data-toggle-mobile-panel="rail"')
    expect(tabBarSource).toContain('aria-controls="runtime-rail"')
    expect(runtimeRailSource).toContain('data-mobile-panel-name="rail"')
    expect(runtimeRailSource).toContain('studio-mobile-panel--right')
  })

  test('opens one panel at a time and closes the active panel', () => {
    expect(nextMobilePanel(undefined, 'sidebar')).toBe('sidebar')
    expect(nextMobilePanel('sidebar', 'rail')).toBe('rail')
    expect(nextMobilePanel('rail', 'rail')).toBeUndefined()
  })

  test('isolates an open drawer from status controls', () => {
    expect(tabBarSource).toContain('studio-topbar')
    expect(mobilePanelSource).toContain('closeVersionMenus()')
    expect(studioStyles).toContain(
      '.studio-shell[data-mobile-panel] .studio-statusbar',
    )
  })
})
