type MobilePanelName = 'sidebar' | 'rail'

type CloseOptions = {
  restoreFocus?: boolean
}

const MOBILE_QUERY = '(max-width: 1023px)'
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function isMobileViewport() {
  return window.matchMedia(MOBILE_QUERY).matches
}

function getOpenPanel(shell: HTMLElement): MobilePanelName | undefined {
  const panel = shell.dataset.mobilePanel
  return panel === 'sidebar' || panel === 'rail' ? panel : undefined
}

function getPanel(shell: HTMLElement, name: MobilePanelName) {
  return shell.querySelector<HTMLElement>(`[data-mobile-panel-name="${name}"]`)
}

function getFocusableElements(panel: HTMLElement) {
  return [...panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)].filter(
    (element) => !element.hidden && element.getClientRects().length > 0,
  )
}

function syncMobilePanelState(shell: HTMLElement) {
  const mobile = isMobileViewport()
  const openPanel = mobile ? getOpenPanel(shell) : undefined

  shell
    .querySelectorAll<HTMLElement>('[data-toggle-mobile-panel]')
    .forEach((toggle) => {
      const panel = toggle.dataset.toggleMobilePanel as
        | MobilePanelName
        | undefined
      const expanded = Boolean(panel && panel === openPanel)
      toggle.setAttribute('aria-expanded', String(expanded))
      const openLabel = toggle.dataset.openLabel
      const closeLabel = toggle.dataset.closeLabel
      if (openLabel && closeLabel) {
        toggle.setAttribute('aria-label', expanded ? closeLabel : openLabel)
      }
    })

  shell
    .querySelectorAll<HTMLElement>('[data-mobile-panel-name]')
    .forEach((panel) => {
      const name = panel.dataset.mobilePanelName as MobilePanelName | undefined
      if (!mobile) {
        panel.removeAttribute('aria-hidden')
        panel.removeAttribute('aria-modal')
        panel.removeAttribute('inert')
        panel.removeAttribute('role')
        panel.removeAttribute('tabindex')
        return
      }

      const expanded = Boolean(name && name === openPanel)
      panel.setAttribute('aria-hidden', String(!expanded))
      panel.toggleAttribute('inert', !expanded)
      panel.setAttribute('role', 'dialog')
      panel.setAttribute('tabindex', '-1')
      if (expanded) panel.setAttribute('aria-modal', 'true')
      else panel.removeAttribute('aria-modal')
    })
}

function closeMobilePanel(
  shell: HTMLElement,
  { restoreFocus = true }: CloseOptions = {},
) {
  delete shell.dataset.mobilePanel
  syncMobilePanelState(shell)

  if (restoreFocus && window.__leohuynhMobilePanelTrigger?.isConnected) {
    window.__leohuynhMobilePanelTrigger.focus({ preventScroll: true })
  }
  window.__leohuynhMobilePanelTrigger = undefined
}

function toggleMobilePanel(
  shell: HTMLElement,
  name: MobilePanelName,
  trigger: HTMLElement,
) {
  if (!isMobileViewport()) return
  if (getOpenPanel(shell) === name) {
    closeMobilePanel(shell)
    return
  }

  shell.dataset.mobilePanel = name
  window.__leohuynhMobilePanelTrigger = trigger
  syncMobilePanelState(shell)

  const panel = getPanel(shell, name)
  requestAnimationFrame(() => {
    const firstFocusable = panel && getFocusableElements(panel)[0]
    ;(firstFocusable ?? panel)?.focus({ preventScroll: true })
  })
}

function trapPanelFocus(event: KeyboardEvent, shell: HTMLElement) {
  const openPanel = getOpenPanel(shell)
  const panel = openPanel && getPanel(shell, openPanel)
  if (!panel) return

  const focusable = getFocusableElements(panel)
  if (focusable.length === 0) {
    event.preventDefault()
    panel.focus({ preventScroll: true })
    return
  }

  const first = focusable[0]
  const last = focusable.at(-1)
  const active = document.activeElement
  if (event.shiftKey && (active === first || !panel.contains(active))) {
    event.preventDefault()
    last?.focus({ preventScroll: true })
  } else if (!event.shiftKey && (active === last || !panel.contains(active))) {
    event.preventDefault()
    first.focus({ preventScroll: true })
  }
}

function bindMobilePanelListeners() {
  if (window.__leohuynhMobilePanelsBound) return
  window.__leohuynhMobilePanelsBound = true

  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement
    const toggle = target.closest<HTMLElement>('[data-toggle-mobile-panel]')
    if (toggle) {
      const shell = toggle.closest<HTMLElement>('.studio-shell')
      const panel = toggle.dataset.toggleMobilePanel as
        | MobilePanelName
        | undefined
      if (shell && panel) toggleMobilePanel(shell, panel, toggle)
      return
    }

    const backdrop = target.closest<HTMLElement>('[data-mobile-panel-backdrop]')
    if (backdrop) {
      const shell = backdrop.closest<HTMLElement>('.studio-shell')
      if (shell) closeMobilePanel(shell)
      return
    }

    const panelLink = target.closest<HTMLElement>(
      '[data-mobile-panel-name] a[href]',
    )
    if (panelLink) {
      const shell = panelLink.closest<HTMLElement>('.studio-shell')
      if (shell && getOpenPanel(shell)) {
        closeMobilePanel(shell, { restoreFocus: false })
      }
    }
  })

  document.addEventListener('keydown', (event) => {
    const shell = document.querySelector<HTMLElement>(
      '.studio-shell[data-mobile-panel]',
    )
    if (!shell || !isMobileViewport()) return

    if (event.key === 'Escape') {
      event.preventDefault()
      closeMobilePanel(shell)
    } else if (event.key === 'Tab') {
      trapPanelFocus(event, shell)
    }
  })

  document.addEventListener('astro:before-swap', () => {
    document
      .querySelectorAll<HTMLElement>('.studio-shell[data-mobile-panel]')
      .forEach((shell) => {
        closeMobilePanel(shell, { restoreFocus: false })
      })
  })

  window.matchMedia(MOBILE_QUERY).addEventListener('change', () => {
    document.querySelectorAll<HTMLElement>('.studio-shell').forEach((shell) => {
      closeMobilePanel(shell, { restoreFocus: false })
    })
  })
}

export function setupMobilePanels(shell: HTMLElement) {
  if (!isMobileViewport()) delete shell.dataset.mobilePanel
  syncMobilePanelState(shell)
  bindMobilePanelListeners()
}
