// Version-switcher popover, right-rail toggle, and explorer folder collapse —
// the click-driven UI bits of the shell. Folder + rail state live on `window`
// / localStorage so they survive SPA navigation.

export function closeVersionMenus() {
  document
    .querySelectorAll<HTMLElement>('[data-version-popover]')
    .forEach((popover) => {
      popover.hidden = true
    })
  document.querySelectorAll('[data-version-trigger]').forEach((trigger) => {
    trigger.setAttribute('aria-expanded', 'false')
  })
}

/** Document-level listeners for the footer version menu. Binds only once. */
export function bindVersionMenu() {
  if (window.__leohuynhVersionMenuBound) return
  window.__leohuynhVersionMenuBound = true

  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement
    const trigger = target.closest('[data-version-trigger]')
    if (trigger) {
      const menu = trigger.closest('[data-version-menu]')
      const popover = menu?.querySelector<HTMLElement>('[data-version-popover]')
      const willOpen = popover?.hidden
      closeVersionMenus()
      if (popover && willOpen) {
        popover.hidden = false
        trigger.setAttribute('aria-expanded', 'true')
      }
      return
    }
    // a menu item navigates natively; just close the popover
    if (target.closest('[data-version-item]')) {
      closeVersionMenus()
      return
    }
    if (!target.closest('[data-version-popover]')) closeVersionMenus()
  })
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeVersionMenus()
  })
}

/** Right-rail show/hide, persisted to localStorage and the root dataset. */
export function setupRail(shell: HTMLElement, root: HTMLElement) {
  const toggle = shell.querySelector<HTMLElement>('[data-toggle-rail]')
  const saved =
    root.dataset.rail ||
    localStorage.getItem('leohuynh:right-rail') ||
    'visible'
  const setRail = (state: string) => {
    shell.dataset.rail = state
    root.dataset.rail = state
    if (toggle) {
      toggle.textContent =
        state === 'hidden' ? 'show right rail' : 'hide right rail'
      toggle.setAttribute('aria-expanded', String(state !== 'hidden'))
    }
    localStorage.setItem('leohuynh:right-rail', state)
  }
  setRail(saved)
  if (toggle && !toggle.dataset.bound) {
    toggle.dataset.bound = 'true'
    toggle.addEventListener('click', () => {
      setRail(
        (root.dataset.rail || shell.dataset.rail) === 'hidden'
          ? 'visible'
          : 'hidden',
      )
    })
  }
}

/** Explorer folder collapse toggles, state kept on `window` across SPA nav. */
export function setupFolders(shell: HTMLElement) {
  shell
    .querySelectorAll<HTMLElement>('[data-folder-toggle]')
    .forEach((button) => {
      if (button.dataset.bound) return
      button.dataset.bound = 'true'
      const id = button.getAttribute('data-folder-toggle')
      const children = shell.querySelector<HTMLElement>(
        `[data-folder-children="${id}"]`,
      )
      const caret = button.querySelector<HTMLElement>('.explorer-caret')
      // Folder open/close lives on `window` so it survives SPA navigation but
      // resets to the default on a full page reload.
      window.__leohuynhFolders ||= {}
      const store = window.__leohuynhFolders
      const setOpen = (open: boolean) => {
        button.setAttribute('aria-expanded', String(open))
        if (children) children.hidden = !open
        if (caret)
          caret.style.transform = open ? 'rotate(0deg)' : 'rotate(-90deg)'
        if (id) store[id] = open
      }
      const defaultOpen =
        button.getAttribute('data-folder-default') !== 'closed'
      setOpen(id && id in store ? store[id] : defaultOpen)
      button.addEventListener('click', () => {
        setOpen(button.getAttribute('aria-expanded') !== 'true')
      })
    })
}
