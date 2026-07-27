import './globals'
import { setupClock, setupCommitAgo } from './clock'
import { bindVersionMenu, setupFolders, setupRail } from './interactions'
import { setupMobilePanels } from './mobile-panels'
import { setupNavPending } from './nav-pending'
import { initStudioTabs } from './tabs'

function initStudioShell() {
  const root = document.documentElement
  // Code blocks render with a fixed light theme and the default mono font.
  // (Also set pre-paint in BaseLayout's head to avoid a flash.)
  root.dataset.theme = 'github-light-default'
  root.dataset.codeFont = 'ui-mono'

  bindVersionMenu()
  setupNavPending()

  document.querySelectorAll<HTMLElement>('.studio-shell').forEach((shell) => {
    initStudioTabs(shell)
    setupRail(shell, root)
    setupMobilePanels(shell)
    setupFolders(shell)
    setupClock(shell)
    setupCommitAgo(shell)
  })
}

initStudioShell()
document.addEventListener('astro:page-load', initStudioShell)
